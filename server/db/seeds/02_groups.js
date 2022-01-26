exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('groups').del()
  .then(function () {
    // Inserts seed entries
    return knex('groups').insert(
      [
        {
          g_group_name: 'Practice English',
          g_group_type: null,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Public Speaking',
          g_group_type: null,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Presentation',
          g_group_type: null,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'First group',
          g_group_type: false,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'second group',
          g_group_type: false,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'third group',
          g_group_type: false,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'forth group',
          g_group_type: false,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'fifth group',
          g_group_type: false,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'sixth group',
          g_group_type: false,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'First DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Second DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Third DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Forth DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Fifth DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Sixth DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Seenth DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },

        {
          g_group_name: 'Eight DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Nin DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Tenth DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        },
        {
          g_group_name: 'Elev DM',
          g_group_type: true,
          g_members: 0,
          g_created_by: 1,
          g_is_active: true
        }
      ]
    );
  });
};

// knex seed:run --specific=02_groups.js