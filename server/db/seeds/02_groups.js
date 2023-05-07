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
        }
      ]
    );
  });
};

// knex seed:run --specific=02_groups.js