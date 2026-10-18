import os
import re
import csv
from pathlib import Path
from dotenv import load_dotenv
from falkordb import FalkorDB

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
HOST = os.getenv("FALKORDB_HOST", "localhost")
PORT = int(os.getenv("FALKORDB_PORT", "6379"))
GRAPH_NAME = os.getenv("FALKORDB_GRAPH", "company_brain")

# Known datasets create typed entities. Every CSV beside this script is also
# imported as DatasetRow, so extra datasets are not silently ignored.
KNOWN_DATASETS = {
    "dataset": "dataset.csv",
    "employeedata": "employee_data.csv",
    "employeeengagementsurveydata": "employee_engagement_survey_data.csv",
    "recruitmentdata": "recruitment_data.csv",
    "traininganddevelopmentdata": "training_and_development_data.csv",
}

def canonical_dataset_name(filename):
    key = norm(Path(filename).stem)
    return KNOWN_DATASETS.get(key, filename)

def discover_dataset_files():
    return sorted(
        (item for item in BASE_DIR.glob("*.csv") if item.is_file()),
        key=lambda item: item.name.lower(),
    )

def clean_key(value):
    key = re.sub(r"[^A-Za-z0-9_]", "_", str(value).strip())
    key = re.sub(r"_+", "_", key).strip("_")
    if not key:
        key = "column"
    if key[0].isdigit():
        key = "col_" + key
    return key

def norm(value):
    return re.sub(r"[^a-z0-9]", "", str(value or "").strip().lower())

def read_rows(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise ValueError(f"{path.name} has no header row")
        for row_number, row in enumerate(reader, start=1):
            props = {}
            for column, value in row.items():
                if column is None:
                    continue
                key = clean_key(column)
                val = str(value or "").strip()
                if val and val.lower() not in {"nan", "none", "null", "n/a"}:
                    props[key] = val
            yield row_number, props

def get_value(props, *keys):
    # Dataset columns are converted to underscore-style property names.
    lookup = {norm(k): v for k, v in props.items()}
    for key in keys:
        value = lookup.get(norm(key))
        if value:
            return value
    return ""

def upsert_dataset_row(graph, dataset, row_number, props):
    graph.query(
        """
        MERGE (n:DatasetRow {dataset: $dataset, row_id: $row_id})
        SET n += $props
        """,
        {"dataset": dataset, "row_id": str(row_number), "props": props},
    )

def upsert_employee(graph, employee_id, props):
    if not employee_id:
        return
    first = get_value(props, "first_name", "FirstName", "First Name")
    last = get_value(props, "last_name", "LastName", "Last Name")
    full = get_value(props, "full_name", "name", "Employee Name")
    if not full:
        full = " ".join(part for part in [first, last] if part).strip()
    if not full:
        full = employee_id

    graph.query(
        """
        MERGE (e:Employee {employee_id: $employee_id})
        SET e.name = $name,
            e.department = $department,
            e.job_title = $job_title,
            e.email = $email,
            e.location = $location,
            e.status = $status,
            e.skills = $skills,
            e.source_dataset = $source_dataset
        """,
        {
            "employee_id": str(employee_id),
            "name": full,
            "department": get_value(props, "department", "BusinessUnit", "DepartmentType", "Division"),
            "job_title": get_value(props, "job_title", "Title", "JobFunctionDescription"),
            "email": get_value(props, "email", "ADEmail"),
            "location": get_value(props, "location", "LocationCode", "State"),
            "status": get_value(props, "employment_status", "EmployeeStatus"),
            "skills": get_value(props, "skills"),
            "source_dataset": get_value(props, "_source_dataset") or "company CSV datasets",
        },
    )

def create_typed_entities(graph, dataset, props):
    dataset = canonical_dataset_name(dataset)
    # Main employee/project dataset
    if dataset == "dataset.csv":
        employee_id = get_value(props, "employee_id")
        if employee_id:
            upsert_employee(graph, employee_id, props)
        project_id = get_value(props, "project_id")
        project_name = get_value(props, "project_name")
        if project_id or project_name:
            identity = project_id or project_name
            graph.query(
                """
                MERGE (p:Project {project_key: $project_key})
                SET p.project_id = $project_id, p.name = $name
                """,
                {"project_key": str(identity), "project_id": project_id, "name": project_name or project_id},
            )
            if employee_id:
                graph.query(
                    """
                    MATCH (e:Employee {employee_id: $employee_id}),
                          (p:Project {project_key: $project_key})
                    MERGE (e)-[:ASSIGNED_TO]->(p)
                    """,
                    {"employee_id": str(employee_id), "project_key": str(identity)},
                )
        manager_id = get_value(props, "manager_id")
        if employee_id and manager_id:
            # Manager node may be created by another row; MATCH only creates the edge when both exist.
            graph.query(
                """
                MATCH (e:Employee {employee_id: $employee_id}),
                      (m:Employee {employee_id: $manager_id})
                MERGE (m)-[:MANAGES]->(e)
                """,
                {"employee_id": str(employee_id), "manager_id": str(manager_id)},
            )

    # HR employee dataset (EmpID)
    elif dataset == "employee_data.csv":
        employee_id = get_value(props, "EmpID")
        if employee_id:
            upsert_employee(graph, employee_id, props)

    # Engagement surveys link to employees when IDs match.
    elif dataset == "employee_engagement_survey_data.csv":
        employee_id = get_value(props, "Employee ID")
        survey_date = get_value(props, "Survey Date") or "undated"
        survey_key = f"{employee_id}:{survey_date}"
        graph.query(
            """
            MERGE (s:EngagementSurvey {survey_key: $survey_key})
            SET s.employee_id = $employee_id,
                s.survey_date = $survey_date,
                s.engagement_score = $engagement_score,
                s.satisfaction_score = $satisfaction_score,
                s.work_life_balance_score = $work_life_balance_score
            """,
            {
                "survey_key": survey_key,
                "employee_id": employee_id,
                "survey_date": survey_date,
                "engagement_score": get_value(props, "Engagement Score"),
                "satisfaction_score": get_value(props, "Satisfaction Score"),
                "work_life_balance_score": get_value(props, "Work-Life Balance Score"),
            },
        )
        if employee_id:
            graph.query(
                """
                MATCH (e:Employee {employee_id: $employee_id}),
                      (s:EngagementSurvey {survey_key: $survey_key})
                MERGE (e)-[:HAS_ENGAGEMENT_SURVEY]->(s)
                """,
                {"employee_id": str(employee_id), "survey_key": survey_key},
            )

    # Recruitment applicants are separate from employees until hired/matched.
    elif dataset == "recruitment_data.csv":
        applicant_id = get_value(props, "Applicant ID")
        if applicant_id:
            graph.query(
                """
                MERGE (a:Applicant {applicant_id: $applicant_id})
                SET a.name = $name, a.email = $email, a.job_title = $job_title,
                    a.status = $status, a.education_level = $education_level,
                    a.years_experience = $years_experience, a.desired_salary = $desired_salary
                """,
                {
                    "applicant_id": applicant_id,
                    "name": " ".join(filter(None, [get_value(props, "First Name"), get_value(props, "Last Name")])),
                    "email": get_value(props, "Email"),
                    "job_title": get_value(props, "Job Title"),
                    "status": get_value(props, "Status"),
                    "education_level": get_value(props, "Education Level"),
                    "years_experience": get_value(props, "Years of Experience"),
                    "desired_salary": get_value(props, "Desired Salary"),
                },
            )

    # Training rows link to Employee nodes by Employee ID when the IDs align.
    elif dataset == "training_and_development_data.csv":
        employee_id = get_value(props, "Employee ID")
        training_date = get_value(props, "Training Date") or "undated"
        program = get_value(props, "Training Program Name") or "training"
        training_key = f"{employee_id}:{training_date}:{program}"
        graph.query(
            """
            MERGE (t:Training {training_key: $training_key})
            SET t.employee_id = $employee_id, t.training_date = $training_date,
                t.program_name = $program_name, t.training_type = $training_type,
                t.outcome = $outcome, t.trainer = $trainer,
                t.duration_days = $duration_days, t.cost = $cost
            """,
            {
                "training_key": training_key,
                "employee_id": employee_id,
                "training_date": training_date,
                "program_name": program,
                "training_type": get_value(props, "Training Type"),
                "outcome": get_value(props, "Training Outcome"),
                "trainer": get_value(props, "Trainer"),
                "duration_days": get_value(props, "Training Duration(Days)"),
                "cost": get_value(props, "Training Cost"),
            },
        )
        if employee_id:
            graph.query(
                """
                MATCH (e:Employee {employee_id: $employee_id}),
                      (t:Training {training_key: $training_key})
                MERGE (e)-[:ATTENDED_TRAINING]->(t)
                """,
                {"employee_id": str(employee_id), "training_key": training_key},
            )

def main():
    db = FalkorDB(host=HOST, port=PORT)
    graph = db.select_graph(GRAPH_NAME)
    graph.query("RETURN 1 AS connection_test")

    total_rows = 0
    per_file = {}
    dataset_paths = discover_dataset_files()

    if not dataset_paths:
        print(f"ERROR: No CSV files found beside seed.py in {BASE_DIR}")
        print("Copy your CSV files into this folder and rerun.")
        return

    print("CSV files discovered:")
    for path in dataset_paths:
        print("  -", path.name)

    for path in dataset_paths:
        filename = path.name
        canonical_name = canonical_dataset_name(filename)
        imported = 0
        failed_rows = 0
        print(f"\nImporting {filename} ...")

        try:
            for row_number, props in read_rows(path):
                try:
                    props["_source_dataset"] = filename
                    upsert_dataset_row(graph, filename, row_number, props)
                    create_typed_entities(graph, canonical_name, props)
                    imported += 1
                except Exception as row_exc:
                    failed_rows += 1
                    print(
                        f"  ERROR row {row_number}: "
                        f"{type(row_exc).__name__}: {row_exc}"
                    )

            per_file[filename] = {
                "imported": imported,
                "failed": failed_rows,
            }
            total_rows += imported
            print(
                f"  Imported/updated {imported} rows; "
                f"failed rows: {failed_rows}"
            )
        except Exception as file_exc:
            per_file[filename] = {
                "imported": imported,
                "failed": failed_rows,
            }
            print(
                f"  FILE ERROR: {type(file_exc).__name__}: {file_exc}"
            )

    # Retry manager links after all employee nodes have been created.
    main_csv = next(
        (
            path for path in dataset_paths
            if canonical_dataset_name(path.name) == "dataset.csv"
        ),
        None,
    )
    if main_csv is not None:
        for _, props in read_rows(main_csv):
            employee_id = get_value(props, "employee_id")
            manager_id = get_value(props, "manager_id")
            if employee_id and manager_id:
                graph.query(
                    """
                    MATCH (e:Employee {employee_id: $employee_id}),
                          (m:Employee {employee_id: $manager_id})
                    MERGE (m)-[:MANAGES]->(e)
                    """,
                    {"employee_id": str(employee_id), "manager_id": str(manager_id)},
                )

    node_counts = graph.query(
        "MATCH (n) RETURN labels(n) AS labels, count(n) AS total"
    )
    relationship_count = graph.query(
        "MATCH ()-[r]->() RETURN count(r) AS total"
    )

    print("\n========== IMPORT SUMMARY ==========")
    print("Graph:", GRAPH_NAME)
    print("Total CSV rows imported/updated:", total_rows)
    for filename, counts in per_file.items():
        print(
            f"  {filename}: {counts['imported']} rows imported/updated, "
            f"{counts['failed']} row failures"
        )
    print("\nNode counts:")
    for labels, count in node_counts.result_set:
        print(f"  {labels}: {count}")
    print("Relationships:", relationship_count.result_set[0][0] if relationship_count.result_set else 0)
    print("\nImport finished. Re-running is safe: rows/entities use stable MERGE keys.")
    print("Note: every CSV in this folder is imported as DatasetRow; known dataset names also create typed entities.")
    print("Note: cross-dataset links are created only where employee IDs match.")

if __name__ == "__main__":
    main()
