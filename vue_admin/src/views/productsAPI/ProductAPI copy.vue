<template>
    <div class="product-api-container">
      <h1>Product API</h1>
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
      </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiData = ref([]);
const loading = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost/services_http/services_http/public/api/products');
    if (Array.isArray(response.data.data)) {
      apiData.value = response.data.data; 
    } else {
      console.error('Expected an array but got:', response.data.data);
      apiData.value = []; // Reset to empty array if data is not as expected
    }
  } catch (error) {
    if (error.response) {
      console.error('Error fetching data:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    apiData.value = []; // Reset to empty array on error
  } finally {
    loading.value = false;
  }
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

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}
</style>