class Route {
  name: string;
  description?: string;
  path?: string;
  children?: Route[];
  version?: string;
}

export default function getRoutesTree(): Route[] {
  return [
    {
      'name': 'Admin',
      'description': 'Admin endpoints',
      'path': '',
      'children': [
        {
          'name': 'AdminModule',
          'path': 'admin',
          'version': '1.0.0'
        }
      ]
    },
    {
      'name': 'Auth',
      'description': 'All things related to authentication',
      'children': [
        {
          'name': 'AuthV1Module',
          'path': 'auth/v1',
          'version': '1.0.0'
        }
      ]
    },
    {
      'name': 'FZtracker',
      'description': 'All things related to FZtracker',
      'children': [
        {
          'name': 'FZtrackerV1Module',
          'path': 'fztracker/v1',
          'version': '1.0.0'
        }
      ]
    }
  ];
}