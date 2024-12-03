<template>
  <div class="order-api-container">
    <h1 class="page-title">Order API</h1>
    <div class="header-actions">
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        Add Order
      </el-button>
    </div>
    <el-card>
      <el-table :data="apiData" v-loading="loading" border style="width: 100%">
        <el-table-column prop="bill_id" label="Order ID" width="120" />
        <el-table-column prop="user_name" label="Customer" min-width="200" />
        <el-table-column prop="bill_time" label="Order Date" width="180" />
        <el-table-column prop="bill_totalPrice" label="Total" width="120" align="right">
          <template #default="{ row }">
            ${{ parseFloat(row.bill_totalPrice).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="bill_status" label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.bill_status)">
              {{ row.bill_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" @click="editOrder(row)">Edit</el-button>
            <el-button type="danger" @click="confirmDelete(row.bill_id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Order Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Order' : 'Add New Order'"
      width="50%"
      @close="resetOrderForm"
    >
      <el-form :model="orderForm" label-width="120px">
        <el-form-item label="Customer Name" prop="customer">
          <el-input v-model="orderForm.customer" placeholder="Enter customer name" />
        </el-form-item>
        <el-form-item label="Products" prop="products">
          <el-select v-model="orderForm.products" multiple placeholder="Select products">
            <el-option
              v-for="product in availableProducts"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="orderForm.status" placeholder="Select status">
            <el-option label="Pending" value="pending" />
            <el-option label="Processing" value="processing" />
            <el-option label="Completed" value="completed" />
            <el-option label="Cancelled" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="Notes" prop="notes">
          <el-input v-model="orderForm.notes" type="textarea" rows="4" placeholder="Enter order notes" />
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
const orderForm = ref({
  id: null,
  customer: '',
  products: [],
  status: 'pending',
  notes: ''
});

const availableProducts = ref([
  { id: 1, name: 'Product 1' },
  { id: 2, name: 'Product 2' },
  { id: 3, name: 'Product 3' }
]);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get('http://localhost/services_http/services_http/public/api/bills');
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
  resetOrderForm();
  dialogVisible.value = true;
};

const resetOrderForm = () => {
  orderForm.value = {
    id: null,
    customer: '',
    products: [],
    status: 'pending',
    notes: ''
  };
};

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`http://localhost/services_http/services_http/public/api/bills/${orderForm.value.id}/status`, orderForm.value);
      ElMessage.success('Order updated successfully');
    } else {
      await axios.post('http://localhost/services_http/services_http/public/api/bills', orderForm.value);
      ElMessage.success('Order created successfully');
    }
    dialogVisible.value = false;
    fetchData(); // Refresh the order list
  } catch (error) {
    console.error('Error saving order:', error);
    ElMessage.error('Failed to save order');
  }
};

const editOrder = (row) => {
  isEdit.value = true;
  orderForm.value = { ...row };
  dialogVisible.value = true;
};

const confirmDelete = (orderId) => {
  ElMessageBox.confirm('Are you sure you want to delete this order?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    try {
      await axios.delete(`http://localhost/services_http/services_http/public/api/bills/${orderId}`);
      ElMessage.success('Order deleted successfully');
      fetchData(); // Refresh the order list
    } catch (error) {
      console.error('Error deleting order:', error);
      ElMessage.error('Failed to delete order');
    }
  }).catch(() => {
    ElMessage.info('Delete canceled');
  });
};

const getStatusType = (status) => {
  const statusMap = {
    '6': 'success', // Completed
    '7': 'warning', // Processing
    '8': 'danger'   // Cancelled
  };
  return statusMap[status] || 'info'; // Default to 'info' if status is unknown
};

onMounted(() => {
  fetchData();
});
</script>