<template>
  <div class="app-container">
    <div class="filter-container" style="display:flex; justify-content:space-between">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" @click="handleCreate">
        新增视频
      </el-button>
      <div>
        <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 90px;" class="filter-item">
          <el-option v-for="(item, key) in statusOptions" :key="key" :label="item" :value="key" />
        </el-select>
        <el-input
          v-model="listQuery.title"
          placeholder="标题"
          style="width: 200px; margin-left: 15px;margin-right: 15px;"
          class="filter-item"
          @keyup.enter.native="handleFilter"
        />
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
      </div>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="视频内容" min-width="180px">
        <template slot-scope="{ row }">
          <div style="display: flex;">
            <img src="row.cover" style="width: 100px; height: 50px;margin-right: 10px;">
            <div style="display: flex; flex-direction: column; justify-content: space-between;">
              <span>{{ row.title }}</span>
              <span style="color: red;">￥{{ row.price }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订阅量" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.sub_count }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="110px">
        <template slot-scope="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status | statusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240px" class-name="small-padding fixed-width">
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status === 0" size="mini" @click="handleModifyStatus(row, 1)">
            上架
          </el-button>
          <el-button v-if="row.status === 1" size="mini" type="success" @click="handleModifyStatus(row, 0)">
            下架
          </el-button>
          <el-popconfirm title="是否删除该图文？" style="margin-left: 10px;" @onConfirm="handleDelete(row, $index)">
            <el-button v-if="row.status != 'deleted'" slot="reference" size="mini" type="danger">
              删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog fullscreen :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
            action="https://jsonplaceholder.typicode.com/posts/"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleUploadRemove"
            :on-success="handleUploadSuccess"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        <el-form-item label="课程介绍" prop="try">
          <tinymce v-model="temp.try" :height="300" :width="600" />
        </el-form-item>
        <el-form-item label="课程内容" prop="content">
          <el-upload
            class="upload-demo"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-remove="handleRemove"
            :limit="1"
            :file-list="fileList"
            :on-change="handleUploadChange"
            accept=".mp4,.avi,.wmv,.mov,.flv,.rmvb"
          >
            <el-button size="small" type="primary">上传视频</el-button>
            <div slot="tip" class="el-upload__tip">
              格式支持mp4，avi，wmv，mov，flv，rmvb格式，文件最大不超过5G，当前版本最大支持1080P超清转码</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="课程价格">
          <el-input-number v-model="temp.price" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="temp.status">
            <el-radio :label="0">下架</el-radio>
            <el-radio :label="1">上架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  fetchList,
  createVideo,
  updateVideo,
  deleteVideo
} from "@/api/video";

import waves from "@/directive/waves"; // waves directive
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination
import Tinymce from "@/components/Tinymce"

const statusOptions = {
  0: "已下架",
  1: "已上架"
};

export default {
  name: "ComplexTable",
  components: {
    Pagination,
    Tinymce
  },
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      return statusOptions[status];
    }
  },
  data() {
    return {
      fileList: [{
        name: "food.mp4",
        url: "https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100"
      }],
      dialogImageUrl: "",
      dialogVisible: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        status: undefined,
        title: undefined,
        sort: "+id"
      },
      sortOptions: [{
        label: "ID Ascending",
        key: "+id"
      },
      {
        label: "ID Descending",
        key: "-id"
      }
      ],
      statusOptions,
      showReviewer: false,
      temp: {
        id: undefined,
        title: "",
        status: 1,
        price: 0,
        try: "",
        content: "",
        cover: "",
      },
      dialogFormVisible: false,
      dialogStatus: "",
      textMap: {
        update: "修改",
        create: "新增"
      },
      rules: {
        title: [{
          required: true,
          message: "标题不能为空",
          trigger: "blur"
        }],
        try: [{
          required: true,
          message: "试看内容不能为空",
          trigger: "blur"
        }],
        content: [{
          required: true,
          message: "课程内容不能为空",
          trigger: "blur"
        }],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleUploadRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleUploadSuccess(response, file, fileList) {
      console.log(response, file, fileList);
    },
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items;
        this.total = response.data.total;

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false;
        }, 1.5 * 1000);
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作成功",
        type: "success"
      });
      row.status = status;
    },
    sortChange(data) {
      const {
        prop,
        order
      } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        title: "",
        status: 1,
        price: 0,
        try: "",
        content: "",
        cover: "",
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createVideo(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row); // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp);
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    updateData() {
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData
            .timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateVideo(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "提交成功",
              type: "success",
              duration: 2000
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      deleteVideo(row).then(res => {
        this.$notify({
          title: "Success",
          message: "删除成功",
          type: "success",
          duration: 2000
        });
        this.list.splice(index, 1);
      })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending";
    },
    handleUploadChange(file, fileList) {
      console.log(file, fileList);
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    }
  }
};

</script>
