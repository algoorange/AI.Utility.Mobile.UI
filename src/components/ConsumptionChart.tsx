import React from 'react';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLegend, VictoryTheme } from 'victory-native';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { UsageRecord } from '@data/mockBills';

interface ConsumptionChartProps {
  data: UsageRecord[];
}

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ data }) => {
  const theme = useTheme();

  return (
    <View>
      <VictoryChart width={350} height={260} theme={VictoryTheme.material} domainPadding={20}>
        <VictoryLegend
          x={70}
          y={10}
          orientation="horizontal"
          gutter={20}
          data={[
            { name: 'Electricity (kWh)', symbol: { fill: theme.colors.primary } },
            { name: 'Water (m³)', symbol: { fill: theme.colors.secondary } }
          ]}
        />
        <VictoryAxis tickValues={data.map((d) => d.month)} tickFormat={data.map((d) => d.month)} />
        <VictoryAxis dependentAxis tickFormat={(value) => `${value}`} />
        <VictoryGroup offset={16} colorScale={[theme.colors.primary, theme.colors.secondary]}>
          <VictoryBar data={data} x="month" y="electricity" cornerRadius={4} />
          <VictoryBar data={data} x="month" y="water" cornerRadius={4} />
        </VictoryGroup>
      </VictoryChart>
    </View>
  );
};

