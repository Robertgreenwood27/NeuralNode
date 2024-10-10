import { useContext } from 'react';
import FlowChartContext from './FlowChartContext';

export function useFlowChart() {
  const context = useContext(FlowChartContext);
  if (!context) {
    throw new Error('useFlowChart must be used within a FlowChartProvider');
  }
  return context;
}