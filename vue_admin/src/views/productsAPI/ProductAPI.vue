<template>
    <div class="product-api-container">
      <h1 class="page-title">Product API</h1>
      <div class="header-actions">
        <el-button type="primary" @click="openDialog()">
          <el-icon><Plus /></el-icon>
          Add Product
        </el-button>
      </div>
      <el-card>
        <el-table :data="apiData" v-loading="loading" border style="width: 100%">
          <el-table-column prop="product_id" label="Product ID" width="120" />
          <el-table-column prop="product_name" label="Product Name" min-width="200" />
          <el-table-column label="Product Image" width="150">
            <template #default="{ row }">
              <el-image
                :src="getImageUrl(row.product_img)"
                fit="cover"
                class="product-image"
                :preview-src-list="[getImageUrl(row.product_img)]"
              />
            </template>
          </el-table-column>
          <el-table-column prop="product_price" label="Price" width="120">
            <template #default="{ row }">
              ${{ parseFloat(row.product_price).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="150" align="center">
            <template #default="{ row }">
              <el-button type="primary" @click="editProduct(row)">Edit</el-button>
              <el-button type="danger" @click="confirmDelete(row.product_id)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Add/Edit Product Dialog -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? 'Edit Product' : 'Add New Product'"
        width="50%"
        @close="resetProductForm"
      >
        <el-form :model="productForm" :rules="rules" label-width="120px">
          <el-form-item label="Product Name" prop="name">
            <el-input v-model="productForm.name" placeholder="Enter product name" />
          </el-form-item>
          <el-form-item label="Product Price" prop="price">
            <el-input-number v-model="productForm.price" :precision="2" :min="0" />
          </el-form-item>
          <el-form-item label="Product Image" prop="image">
            <el-input v-model="productForm.image" placeholder="Enter image filename" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="submitForm">Save</el-button>
        </template>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessageBox, ElMessage } from 'element-plus';

const apiData = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const productForm = ref({
  product_id: null,
  name: '',
  price: 0,
  image: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost/services_http/services_http/public/api/products');
    if (Array.isArray(response.data.data)) {
      apiData.value = response.data.data; 
    } else {
      console.error('Expected an array but got:', response.data.data);
      apiData.value = [];
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    apiData.value = [];
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
  isEdit.value = false;
  resetProductForm();
  dialogVisible.value = true;
};

const resetProductForm = () => {
  productForm.value = {
    product_id: null,
    name: '',
    price: 0,
    image: ''
  };
};

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`http://localhost/services_http/services_http/public/api/products/${productForm.value.product_id}`, productForm.value);
      ElMessage.success('Product updated successfully');
    } else {
      await axios.post('http://localhost/services_http/services_http/public/api/products', productForm.value);
      ElMessage.success('Product added successfully');
    }
    dialogVisible.value = false;
    fetchData(); // Refresh the product list
  } catch (error) {
    console.error('Error saving product:', error);
    ElMessage.error('Failed to save product');
  }
};

const editProduct = (row) => {
  isEdit.value = true;
  productForm.value = { ...row };
  dialogVisible.value = true;
};

const confirmDelete = (productId) => {
  ElMessageBox.confirm('Are you sure you want to delete this product?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`http://localhost/services_http/services_http/public/api/products/${productId}`);
      ElMessage.success('Product deleted successfully');
      fetchData(); // Refresh the product list
    } catch (error) {
      console.error('Error deleting product:', error);
      ElMessage.error('Failed to delete product');
    }
  }).catch(() => {
    ElMessage.info('Delete canceled');
  });
};

const getImageUrl = (imageName) => {
  try {
    return new URL(`../../assets/uploads/${imageName}`, import.meta.url).href;
  } catch (error) {
    console.error('Error loading image:', error);
    return new URL(`../../assets/uploads/placeholder-image.jpg`, import.meta.url).href;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.product-api-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}
</style>