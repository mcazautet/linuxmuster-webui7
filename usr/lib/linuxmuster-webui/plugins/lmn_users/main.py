from jadi import component
from aj.auth import PermissionProvider
from aj.plugins.core.api.sidebar import SidebarItemProvider


@component(SidebarItemProvider)
class ItemProvider(SidebarItemProvider):
    def __init__(self, context):
        self.context = context

    def provide(self):
        return [
            {
                'attach': 'category:usermanagement',
                'name': _('Teachers'),
                'icon': 'user-tie',
                'url': '/view/lm/users/teachers',
                'weight': 15,
            },
            {
                'attach': 'category:usermanagement',
                'name': _('Students'),
                'icon': 'user-graduate',
                'url': '/view/lm/users/students',
                'weight': 15,
            },
            {
                'attach': 'category:usermanagement',
                'name': _('School-Admins'),
                'icon': 'user-ninja',
                'url': '/view/lm/users/schooladmins',
                'weight': 20,
            },
            {
                'attach': 'category:usermanagement',
                'name': _('Global-Admins'),
                'icon': 'user-astronaut',
                'url': '/view/lm/users/globaladmins',
                'weight': 21,
            },
            {
                'attach': 'category:usermanagement',
                'name': _('Listmanagement'),
                'icon': 'list',
                'url': '/view/lm/users/listmanagement',
                'weight': 21,
            }
        ]


@component(PermissionProvider)
class Permissions (PermissionProvider):
    def provide(self):
        return [
            {
                'id': 'lm:users:students:read',
                'name': _('Read students'),
                'default': False,
            },
            {
                'id': 'lm:users:students:write',
                'name': _('Write students'),
                'default': False,
            },
            {
                'id': 'lm:users:teachers:read',
                'name': _('Read teachers'),
                'default': False,
            },
            {
                'id': 'lm:users:teachers:list',
                'name': _('List teachers'),
                'default': False,
            },
            {
                'id': 'lm:users:teachers:write',
                'name': _('Write teachers'),
                'default': False,
            },
            {
                'id': 'lm:users:schooladmins:read',
                'name': _('Read schooladmins'),
                'default': False,
            },
            {
                'id': 'lm:users:schooladmins:write',
                'name': _('Write schooladmins'),
                'default': False,
            },
            {
                'id': 'lm:users:globaladmins:read',
                'name': _('Read globaladmins'),
                'default': False,
            },
            {
                'id': 'lm:users:globaladmins:write',
                'name': _('Write globaladmins'),
                'default': False,
            },
            {
                'id': 'lm:users:extra-students:read',
                'name': _('Read extra students'),
                'default': False,
            },
            {
                'id': 'lm:users:extra-students:write',
                'name': _('Write extra students'),
                'default': False,
            },
            {
                'id': 'lm:users:extra-courses:read',
                'name': _('Read extra courses'),
                'default': False,
            },
            {
                'id': 'lm:users:extra-courses:write',
                'name': _('Write extra courses'),
                'default': False,
            },
            {
                'id': 'lm:users:check',
                'name': _('Check user changes'),
                'default': False,
            },
            {
                'id': 'lm:users:apply',
                'name': _('Apply user changes'),
                'default': False,
            },
            {
                'id': 'lm:users:passwords',
                'name': _('Read/write passwords'),
                'default': False,
            },
            {
                'id': 'lm:users:schooladmins:create',
                'name': _('Add school admins'),
                'default': False,
            },
            {
                'id': 'lm:users:globaladmins:create',
                'name': _('Add global admins'),
                'default': False,
            },
            {
                'id': 'lm:users:schooladmins:delete',
                'name': _('Delete school admins'),
                'default': False,
            },
            {
                'id': 'lm:users:globaladmins:delete',
                'name': _('Delete global admins'),
                'default': False,
            },
        ]
