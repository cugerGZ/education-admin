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

module.exports = [];
