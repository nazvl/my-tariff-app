<script setup>
import { useAuthStore } from "@/store/auth.js";
import { onMounted } from "vue";
import { useRouter } from 'vue-router'
const authStore = useAuthStore();
const router = useRouter();


onMounted(() => {
    console.log(authStore.token);
})

function logout() {
    authStore.logout();
    router.push('/login');
}


</script>


<template>
<button @click="logout">ВЫХОД</button>
</template>