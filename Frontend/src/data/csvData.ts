import datasetCsv from './dataset.csv?raw';
import employeeDataCsv from './employee_data.csv?raw';
import engagementCsv from './employee_engagement_survey_data.csv?raw';
import recruitmentCsv from './recruitment_data.csv?raw';
import trainingCsv from './training_and_development_data.csv?raw';

type CsvRow = Record<string, string>;

function parseCsv(csv: string): CsvRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const nextCharacter = csv[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(value.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (value || row.length > 0) {
    row.push(value.trim());
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map((record) => headers.reduce<CsvRow>((result, header, index) => {
    result[header] = record[index] ?? '';
    return result;
  }, {}));
}

export const datasets = {
  employeeDirectory: parseCsv(employeeDataCsv),
  employeeRecords: parseCsv(datasetCsv),
  engagement: parseCsv(engagementCsv),
  recruitment: parseCsv(recruitmentCsv),
  training: parseCsv(trainingCsv),
};

export const csvMetrics = {
  employeesIndexed: datasets.employeeDirectory.length,
  activeEmployees: datasets.employeeDirectory.filter((row) => row.employment_status === 'Active').length,
  averageEngagement: Math.round(
    datasets.engagement.reduce((total, row) => total + Number(row['Engagement Score'] || 0), 0) / datasets.engagement.length * 20,
  ),
  candidates: datasets.recruitment.length,
  trainingRecords: datasets.training.length,
  completedTraining: datasets.training.filter((row) => ['Completed', 'Passed'].includes(row['Training Outcome'])).length,
};

export const datasetCards = [
  { key: 'employeeDirectory', label: 'Employee Directory', detail: 'People and role records', rows: datasets.employeeDirectory.length, tone: 'primary' as const },
  { key: 'employeeRecords', label: 'Employee Records', detail: 'Workforce master data', rows: datasets.employeeRecords.length, tone: 'accent' as const },
  { key: 'engagement', label: 'Engagement Surveys', detail: 'Engagement and wellbeing', rows: datasets.engagement.length, tone: 'info' as const },
  { key: 'recruitment', label: 'Recruitment Pipeline', detail: 'Candidate applications', rows: datasets.recruitment.length, tone: 'warning' as const },
  { key: 'training', label: 'Training & Development', detail: 'Learning outcomes and cost', rows: datasets.training.length, tone: 'success' as const },
];
