import { useEffect, useState, useCallback } from 'react';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import styles from './style.module.css';

interface WorkflowStatusData {
  conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped' | 'neutral';
  status?: 'completed' | 'in_progress' | 'queued';
  name?: string;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
}

const WorkflowStatus = () => {
  const { githubWorkflow } = useSiteMetadata();
  const [statuses, setStatuses] = useState<WorkflowStatusData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const allRuns: WorkflowStatusData[] = [];

      for (const file of githubWorkflow.workflowFile) {
        const url = `https://api.github.com/repos/${githubWorkflow.owner}/${githubWorkflow.repo}/actions/workflows/${file}/runs?per_page=1`;
        const res = await fetch(url);

        if (res.status === 403) {
          setError('request github api rate limit exceeded, please check your github token or try again later');
          return;
        }

        if (!res.ok) throw new Error(res.statusText);

        const { workflow_runs } = await res.json();
        if (workflow_runs[0]) {
          allRuns.push(workflow_runs[0]);
        }
      }

      setStatuses(allRuns);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [githubWorkflow]);

  useEffect(() => {
    const fileCount = githubWorkflow.workflowFile.length;
    const intervalTime = Math.ceil((60 * 60 * 1000) / (60 / fileCount)) + 5000;
    const interval = setInterval(fetchStatus, intervalTime);
    fetchStatus();
    return () => clearInterval(interval);
  }, [fetchStatus, githubWorkflow]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Workflow</th>
          <th className={styles.th}>Last Build</th>
          <th className={styles.th}>Time</th>
        </tr>
      </thead>
      <tbody>
        {statuses.map((status, index) => (
          <tr key={index}>
            <td className={styles.td}>
              {status.html_url ? (
                <a
                  href={status.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {status.name || 'N/A'}
                </a>
              ) : (
                status.name || 'N/A'
              )}
            </td>
            <td className={styles.td}>
              {status.status === 'completed' ? (
                <span
                  className={
                    status.conclusion === 'success'
                      ? styles.success
                      : status.conclusion === 'failure'
                      ? styles.failure
                      : styles.neutral
                  }
                >
                  {status.conclusion || 'N/A'}
                </span>
              ) : (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}></div>
                </div>
              )}
            </td>
            <td className={styles.td}>
              {status.created_at ? new Date(status.created_at).toLocaleString() : 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WorkflowStatus;
