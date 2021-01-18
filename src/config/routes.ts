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
      'description': 'All methods related to authentication',
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
      'description': 'All methods related to FZtracker',
      'children': [
        {
          'name': 'FZtracker',
          'path': 'fztracker',
          'version': '1.0.0'
        }
      ]
    }
  ];
}