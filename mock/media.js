const Mock = require("mockjs");

const List = [];
const count = 100;

for (let i = 0; i < count; i++) {
  List.push(
    Mock.mock({
      id: "@increment",
      title: "@csentence(5, 10)",
      cover: "@image()",
      try: "@cparagraph",
      content: "@cparagraph",
      "price|1": [1, 998, 663, 658, 985],
      "status|1": [0, 1],
      "sub_count|1": [1, 998, 663, 658, 985],
      create_time: "@now",
      update_time: "@now"
    })
  );
}

module.exports = [
  {
    url: "/vue-element-admin/media/list",
    type: "get",
    response: config => {
      const { title, page = 1, limit = 20, sort } = config.query;

      let mockList = List.filter(item => {
        // if (type && item.type !== type) return false;
        if (title && item.title.indexOf(title) < 0) return false;
        return true;
      });

      if (sort === "-id") {
        mockList = mockList.reverse();
      }

      const pageList = mockList.filter(
        (item, index) => index < limit * page && index >= limit * (page - 1)
      );

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      };
    }
  },
  {
    url: "/vue-element-admin/media/create",
    type: "post",
    response: _ => {
      return {
        code: 20000,
        data: "success"
      };
    }
  },

  {
    url: "/vue-element-admin/media/update",
    type: "post",
    response: _ => {
      return {
        code: 20000,
        data: "success"
      };
    }
  },
  {
    url: "/vue-element-admin/media/delete",
    type: "post",
    response: _ => {
      return {
        code: 20000,
        data: "success"
      };
    }
  }
];
