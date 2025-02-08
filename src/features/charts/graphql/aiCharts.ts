import { gql } from '@apollo/client';

export const GET_AI_CHART_PROMPT_CONFIG = gql`
  query GenerateChart($info: AiChartQuery!) {
    generateChart(info: $info)
  }
`;
