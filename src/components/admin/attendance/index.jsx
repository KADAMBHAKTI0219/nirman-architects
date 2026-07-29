import React from 'react';
import WorkforceCommandCenter from '../workforce/WorkforceCommandCenter';

export default function Attendance({ tab = 'attendance' }) {
  return <WorkforceCommandCenter defaultTab={tab} />;
}
