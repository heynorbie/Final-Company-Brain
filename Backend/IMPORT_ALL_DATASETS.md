# Company Brain — import all five datasets

Copy `seed.py` and all five CSV files into the same backend folder (the folder that contains `app.py` and `.env`).

Included datasets:
- `dataset.csv`
- `employee_data.csv`
- `employee_engagement_survey_data.csv`
- `recruitment_data.csv`
- `training_and_development_data.csv`

Run in PowerShell from the backend folder:
```powershell
python -m pip install -r requirements.txt
python seed.py
```

Ensure FalkorDB is running and `.env` has the correct `FALKORDB_HOST`, `FALKORDB_PORT`, and `FALKORDB_GRAPH`.

The importer:
- Imports every row from all five CSVs as a `DatasetRow` with source filename and row ID.
- Creates typed Employee, Project, EngagementSurvey, Applicant, and Training nodes.
- Creates relationships for employee-project assignments, managers, engagement surveys, and training where matching IDs exist.
- Uses stable MERGE keys so re-running updates existing rows instead of duplicating the same dataset rows.
- Does not insert the old hard-coded Arjun/BUG-104/DEC-021 sample records.

It does not automatically infer applicant-to-employee matches; applicants remain separate records unless your data explicitly links them.
