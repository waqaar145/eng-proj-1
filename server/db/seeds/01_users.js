
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('table_name').del()
    .then(function () {
      // Inserts seed entries
      return knex('table_name').insert([
        {id: 1, colName: 'rowValue1'},
        {id: 2, colName: 'rowValue2'},
        {id: 3, colName: 'rowValue3'}
      ]);
    });
};



exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
  .then(function () {
    // Inserts seed entries

    // Password - qwerty

    let mainUsers = [
      {
        u_first_name: "Waqaar",
        u_last_name: "Aslam",
        u_username: "waqaar145",
        u_email: "waqaar145@gmail.com",
        u_mobile: 9898989898,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
        u_designation: "Professional Footballer"
      },
      {
        u_first_name: "Mason",
        u_last_name: "Greenwood",
        u_username: "mason123",
        u_email: "mason123@gmail.com",
        u_mobile: 9898989891,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://i2-prod.manchestereveningnews.co.uk/sport/article21334405.ece/ALTERNATES/s1200c/0_GettyImages-1234586511.jpg",
        u_designation: "Professional Footballer"
      },
      {
        u_first_name: "Jesse",
        u_last_name: "Lingard",
        u_username: "jesse123",
        u_email: "jesse123@gmail.com",
        u_mobile: 9898989892,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://ichef.bbci.co.uk/news/976/cpsprodpb/66B1/production/_120498262_gettyimages-1338480699.jpg",
        u_designation: "Professional Footballer"
      },
      {
        u_first_name: "Harry",
        u_last_name: "Maquire",
        u_username: "harry123",
        u_email: "harry123@gmail.com",
        u_mobile: 9898989893,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://resources.premierleague.com/premierleague/photos/players/250x250/p95658.png",
        u_designation: "Professional Footballer"
      },
      {
        u_first_name: "Jadon",
        u_last_name: "Sancho",
        u_username: "jadon123",
        u_email: "jadon123@gmail.com",
        u_mobile: 9898989894,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://static.independent.co.uk/s3fs-public/thumbnails/image/2020/08/30/13/Jadon-Sancho.jpg?width=982&height=726&auto=webp&quality=75",
        u_designation: "Professional Footballer"
      },
      {
        u_first_name: "Luke",
        u_last_name: "Shaw",
        u_username: "luke123",
        u_email: "luke123@gmail.com",
        u_mobile: 9898989895,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://static.independent.co.uk/2021/03/01/10/newFile-6.jpg?width=982&height=726&auto=webp&quality=75",
        u_designation: "Professional Footballer"
      },
      {
        u_first_name: "Paul",
        u_last_name: "Pogba",
        u_username: "paul123",
        u_email: "paul123@gmail.com",
        u_mobile: 9898989896,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://sm.imgix.net/21/32/paul-pogba.JPG?w=1200&h=1200&auto=compress,format&fit=clip",
        u_designation: "Professional Footballer"
      },
      {
        u_first_name: "Virat",
        u_last_name: "Kohli",
        u_username: "virat123",
        u_email: "virat123@gmail.com",
        u_mobile: 9898989897,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://m.cricbuzz.com/a/img/v1/192x192/i1/c170661/virat-kohli.jpg",
        u_designation: "Professional Cricketer"
      },
      {
        u_first_name: "MS",
        u_last_name: "Dhoni",
        u_username: "ms123",
        u_email: "mas123@gmail.com",
        u_mobile: 9898989888,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://c.ndtvimg.com/2021-04/1lrriqc8_ms-dhoni-bcciipl_625x300_20_April_21.jpg",
        u_designation: "Professional Cricketer"
      },
      {
        u_first_name: "KL",
        u_last_name: "Rahul",
        u_username: "kl123",
        u_email: "kl123@gmail.com",
        u_mobile: 9898989899,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://m.cricbuzz.com/a/img/v1/192x192/i1/c170673/kl-rahul.jpg",
        u_designation: "Professional Cricketer"
      },
      {
        u_first_name: "Shreyas",
        u_last_name: "Iyer",
        u_username: "shrey123",
        u_email: "shrey123@gmail.com",
        u_mobile: 9898989810,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Shreyas_Iyer2020.jpg",
        u_designation: "Professional Cricketer"
      },
      {
        u_first_name: "Floyed",
        u_last_name: "Mayweather",
        u_username: "money123",
        u_email: "money123@gmail.com",
        u_mobile: 9800000000,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8wjWrUx0IAIKvO2kHOg5TN6Wpj9ybhKC7AA&usqp=CAU",
        u_designation: "Professional Cricketer"
      },
    ]

    let fedUsers = [];
    for (i = 1; i < 300; i++) {
      fedUsers.push({
        u_first_name: `John${i}`,
        u_last_name: `Doe${i}`,
        u_username: `john${i}`,
        u_email: `john${i}@gmail.com`,
        u_mobile: `9999999${i}`,
        u_password: '$2b$10$OJC4Elb0WfbQWqQmJ00hn.R5.GVOWfthT7pEZop6Q6/gQYaot2eZG',
        u_dp: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmlsZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80",
        u_designation: `Professional Footballer${i}`
      })
    }

    return knex('users').insert([...mainUsers, ...fedUsers]);
  });
};