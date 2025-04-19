// Define the main menu routes with proper metadata
export const mainMenu = [
  {
    path: '',
    name: 'home',
    meta: {
      title: 'Home',
      requiresAuth: true,
      icon: 'home'
    }
  },
  {
    path: 'explore',
    name: 'explore',
    meta: {
      title: 'Explore',
      requiresAuth: true,
      icon: 'compass'
    }
  },
  {
    path: 'notifications',
    name: 'notifications',
    meta: {
      title: 'Notifications',
      requiresAuth: true,
      icon: 'bell'
    }
  },
  {
    path: 'create',
    name: 'create',
    meta: {
      title: 'Create Post',
      requiresAuth: true,
      icon: 'plus-square'
    }
  },
  {
    path: 'myblogs',
    name: 'myblogs',
    meta: {
      title: 'My Posts',
      requiresAuth: true,
      icon: 'collection'
    }
  }
];

// Define profile related routes
export const profile = [
  {
    path: 'profile',
    name: 'profile',
    meta: {
      title: 'Profile',
      requiresAuth: true,
      icon: 'user'
    }
  },
  {
    path: 'settings',
    name: 'settings',
    meta: {
      title: 'Settings',
      requiresAuth: true,
      icon: 'cog'
    }
  }
];

// Extra routes for blog details
export const blogRoutes = [
  {
    path: 'blogs/:id',
    name: 'editBlog',
    meta: {
      title: 'Edit Post',
      requiresAuth: true,
      icon: 'pencil'
    }
  }
];

// Combine all routes for easy access
export const allRoutes = [...mainMenu, ...profile, ...blogRoutes];
