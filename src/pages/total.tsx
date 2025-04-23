// import React from 'react';
import ActivityList from '@/components/ActivityList';
import GitWorkflowStat from '@/components/GitWorkflowStat';

const HomePage = () => {
  return (
    <div className="space-y-8">
      <ActivityList />
      {/* 新增状态展示区块 */}
      <section className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h2 className="text-2xl font-semibold mb-4">Site Build Status</h2>
        <GitWorkflowStat />
      </section>
    </div>
  );
};

export default HomePage;
