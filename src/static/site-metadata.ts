interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  keywords: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
  githubWorkflow: {
    owner: string;
    repo: string;
    workflowFile: string[];
  };
}

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl === '/' ? '' : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: 'Run Run Run',
  siteUrl: 'https://r.ohops.org',
  logo: 'https://ocs-cn-north1.heytapcs.com/titans-usercenter-avatar-bucket-cn/zr/3t/mg/zr3tmgegc63aqavys7kvnx4f5q000000.jpg?20250316192146',
  description: 'Personal site and blog',
  keywords: 'workouts, running, cycling, riding, roadtrip, hiking, swimming',
  navLinks: [
    {
      name: 'Summary',
      url: `${getBasePath()}/summary`,
    },
    {
      name: 'Blog',
      url: 'https://www.ohops.org',
    },
    {
      name: 'About',
      url: 'https://github.com/XuHandsome',
    }
  ],
  // summary页新增的github workflow运行状态
  githubWorkflow: {
    owner: 'XuHandsome',  // GitHub用户名
    repo: 'workouts_page',  // 仓库名称
    workflowFile: [
      'keep_sync_strava.yml',
      'run_data_sync.yml',
    ]
  },
};

export default data;
