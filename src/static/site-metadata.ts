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
}

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl === '/' ? '' : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: 'Run Run Run',
  siteUrl: 'https://www.ohops.org',
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
    },
  ],
};

export default data;
