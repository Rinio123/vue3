<template>
    <div class="customer-api-container">
      <h1 class="page-title">Customer API</h1>
      <div class="header-actions">
        <el-button type="primary" @click="openDialog()">
          <el-icon><Plus /></el-icon>
          Add Customer
        </el-button>
      </div>
      <el-card>
        <el-table :data="apiData" v-loading="loading" border style="width: 100%">
          <el-table-column prop="customer_id" label="Customer ID" width="120" />
          <el-table-column prop="customer_name" label="Customer Name" min-width="200" />
          <el-table-column prop="customer_email" label="Email" width="180" />
          <el-table-column prop="customer_phone" label="Phone" width="120" />
          <el-table-column label="Actions" width="200" align="center">
            <template #default="{ row }">
              <el-button type="primary" @click="editCustomer(row)">Edit</el-button>
              <el-button type="danger" @click="confirmDelete(row.customer_id)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- Add/Edit Customer Dialog -->
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? 'Edit Customer' : 'Add New Customer'"
        width="50%"
        @close="resetCustomerForm"
      >
        <el-form :model="customerForm" label-width="120px">
          <el-form-item label="Customer Name" prop="customer_name">
            <el-input v-model="customerForm.customer_name" placeholder="Enter customer name" />
          </el-form-item>
          <el-form-item label="Email" prop="customer_email">
            <el-input v-model="customerForm.customer_email" placeholder="Enter email" />
          </el-form-item>
          <el-form-item label="Phone" prop="customer_phone">
            <el-input v-model="customerForm.customer_phone" placeholder="Enter phone number" />
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
  const customerForm = ref({
    customer_id: null,
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  });
  
  const fetchData = async () => {
    loading.value = true;
    try {
      const response = await axios.get('http://localhost/services_http/services_http/public/api/customers');
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
    resetCustomerForm();
    dialogVisible.value = true;
  };
  
  const resetCustomerForm = () => {
    customerForm.value = {
      customer_id: null,
      customer_name: '',
      customer_email: '',
      customer_phone: ''
    };
  };
  
  const submitForm = async () => {
    try {
      if (isEdit.value) {
        await axios.put(`http://localhost/services_http/services_http/public/api/customers/${customerForm.value.customer_id}`, customerForm.value);
        ElMessage.success('Customer updated successfully');
      } else {
        await axios.post('http://localhost/services_http/services_http/public/api/customers', customerForm.value);
        ElMessage.success('Customer created successfully');
      }
      dialogVisible.value = false;
      fetchData(); // Refresh the customer list
    } catch (error) {
      console.error('Error saving customer:', error);
      ElMessage.error('Failed to save customer');
    }
  };
  
  const editCustomer = (row) => {
    isEdit.value = true;
    customerForm.value = { ...row };
    dialogVisible.value = true;
  };
  
  const confirmDelete = (customerId) => {
    ElMessageBox.confirm('Are you sure you want to delete this customer?', 'Warning', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(async () => {
      try {
        await axios.delete(`http://localhost/services_http/services_http/public/api/customers/${customerId}`);
        ElMessage.success('Customer deleted successfully');
        fetchData(); // Refresh the customer list
      } catch (error) {
        console.error('Error deleting customer:', error);
        ElMessage.error('Failed to delete customer');
      }
    }).catch(() => {
      ElMessage.info('Delete canceled');
    });
  };
  
  onMounted(() => {
    fetchData();
  });
  </script>
  
  <style scoped>
  .customer-api-container {
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
  </style>