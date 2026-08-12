<!-- src/components/PlanBillingComponent.vue -->
<script>
import {
  mdiArrowLeft,
  mdiCreditCardOutline,
  mdiDownload,
  mdiCheckCircle,
  mdiShieldCheckOutline,
  mdiReceiptTextOutline
} from '@mdi/js';

export default {
  name: 'PlanBillingComponent',
  props: {
    user: {
      type: Object,
      default: () => ({
        plan: 'Architect Pro',
        planStatus: 'Active',
        billingCycle: 'Monthly',
        nextPayment: 'Nov 24, 2026',
        amount: '$49.00',
        cardBrand: 'VISA',
        cardLast4: '4242',
        cardExpiry: '12/26'
      })
    }
  },
  data() {
    return {
      icons: {
        mdiArrowLeft,
        mdiCreditCardOutline,
        mdiDownload,
        mdiCheckCircle,
        mdiShieldCheckOutline,
        mdiReceiptTextOutline
      },
      billingHistory: [
        { id: 1, date: 'Oct 24, 2026', description: 'Architect Pro - Monthly', amount: '$49.00' },
        { id: 2, date: 'Sep 24, 2026', description: 'Architect Pro - Monthly', amount: '$49.00' },
        { id: 3, date: 'Aug 24, 2026', description: 'Architect Pro - Monthly', amount: '$49.00' },
        { id: 4, date: 'Jul 24, 2026', description: 'Architect Pro - Monthly', amount: '$49.00' }
      ]
    };
  },
  methods: {
    goBack() {
      if (this.$router) {
        this.$router.push('/settings');
      } else {
        this.$emit('navigate', 'settings');
      }
    },
    downloadInvoice(item) {
      console.log('Downloading invoice for:', item);
      alert(`Downloading PDF invoice for ${item.date}`);
    }
  }
};
</script>

<template>
  <v-container class="pa-4 pa-sm-6 pa-md-8 mx-auto pb-16" style="max-width: 1000px; max-height: calc(100vh - 104px); overflow-y: auto; -webkit-overflow-scrolling: touch;">
    
    <!-- Top Back Navigation -->
    <div class="d-flex align-center mb-6">
      <v-btn
        icon
        variant="text"
        density="comfortable"
        color="#00483C"
        class="mr-2"
        @click="goBack"
        title="Back to Settings"
      >
        <v-icon :icon="icons.mdiArrowLeft"></v-icon>
      </v-btn>
      <span class="text-caption font-weight-bold text-teal-darken-4 text-uppercase tracking-wider">
        Settings / Account
      </span>
    </div>

    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-h4 text-md-h3 font-weight-bold text-teal-darken-4 tracking-tight mb-2">
        Plan & Billing
      </h1>
      <p class="text-body-1 text-grey-medium-emphasis">
        Manage your subscription, payment methods, and invoice history.
      </p>
    </div>

    <!-- Bento Grid Cards: Current Plan & Payment Method -->
    <v-row class="gy-6 mb-10" align="stretch">
      
      <!-- Card 1: Current Plan Card -->
      <v-col cols="12" md="6" class="d-flex flex-column">
        <v-card class="pa-6 elevation-1 fill-height d-flex flex-column justify-space-between" color="surface" rounded="0">
          <div>
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-caption font-weight-bold text-grey-medium-emphasis text-uppercase tracking-wider">
                  Current Plan
                </div>
                <div class="text-h5 font-weight-bold text-teal-darken-4 mt-1">
                  {{ user.plan }}
                </div>
              </div>
              <v-chip size="small" color="#CFE6F2" variant="flat" rounded="0" class="text-teal-darken-4 font-weight-bold px-3">
                {{ user.planStatus }}
              </v-chip>
            </div>

            <v-divider opacity="0.12" class="mb-4"></v-divider>

            <div class="space-y-3 mb-6">
              <div class="d-flex justify-space-between align-center py-2 border-bottom-subtle">
                <span class="text-body-2 text-grey-medium-emphasis">Billing Cycle</span>
                <span class="text-body-2 font-weight-bold text-grey-darken-4">{{ user.billingCycle }}</span>
              </div>
              <div class="d-flex justify-space-between align-center py-2 border-bottom-subtle">
                <span class="text-body-2 text-grey-medium-emphasis">Next Payment</span>
                <span class="text-body-2 font-weight-bold text-grey-darken-4">{{ user.nextPayment }}</span>
              </div>
              <div class="d-flex justify-space-between align-center py-2">
                <span class="text-body-2 text-grey-medium-emphasis">Amount</span>
                <span class="text-h6 font-weight-bold text-teal-darken-4">{{ user.amount }}</span>
              </div>
            </div>
          </div>

          <v-btn
            block
            color="#00483C"
            variant="tonal"
            rounded="0"
            class="text-none font-weight-bold py-3 mt-4"
          >
            Change Plan
          </v-btn>
        </v-card>
      </v-col>

      <!-- Card 2: Payment Method Card -->
      <v-col cols="12" md="6" class="d-flex flex-column">
        <v-card class="pa-6 elevation-1 fill-height d-flex flex-column justify-space-between" color="surface" rounded="0">
          <div>
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-caption font-weight-bold text-grey-medium-emphasis text-uppercase tracking-wider">
                  Payment Method
                </div>
                <div class="text-h5 font-weight-bold text-grey-darken-4 mt-1">
                  Primary Card
                </div>
              </div>
              <v-avatar color="#F2F4F4" size="40" rounded="0">
                <v-icon color="#00483C" size="20" :icon="icons.mdiCreditCardOutline"></v-icon>
              </v-avatar>
            </div>

            <v-divider opacity="0.12" class="mb-4"></v-divider>

            <!-- Card Box Preview -->
            <div class="bg-grey-lighten-4 pa-4 mb-6 d-flex align-center justify-space-between" style="border: 1px solid rgba(0,0,0,0.06);">
              <div class="d-flex align-center gap-3">
                <v-chip color="#00483C" variant="flat" size="small" rounded="0" class="text-white font-weight-bold font-italic px-3">
                  {{ user.cardBrand }}
                </v-chip>
                <div>
                  <div class="text-body-2 font-weight-bold text-grey-darken-4 letter-spacing-widest">
                    •••• {{ user.cardLast4 }}
                  </div>
                  <div class="text-caption text-grey-medium-emphasis">
                    Expires {{ user.cardExpiry }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <v-btn
            block
            color="#00483C"
            variant="flat"
            rounded="0"
            class="text-white font-weight-bold text-none py-3 mt-4"
          >
            Update Payment
          </v-btn>
        </v-card>
      </v-col>

    </v-row>

    <!-- Billing History Section -->
    <div class="mt-6">
      <div class="text-h6 font-weight-bold text-grey-darken-4 mb-4">
        Billing History
      </div>

      <v-card class="elevation-1" color="surface" rounded="0">
        
        <!-- Table Header (Desktop Only) -->
        <div class="d-none d-sm-flex align-center pa-4 bg-grey-lighten-4 border-bottom-subtle text-caption font-weight-bold text-grey-medium-emphasis text-uppercase tracking-wider">
          <div class="w-25">Date</div>
          <div class="w-40">Description</div>
          <div class="w-20">Amount</div>
          <div class="w-15 text-right">Invoice</div>
        </div>

        <!-- Billing Rows -->
        <v-list class="pa-0">
          <template v-for="(item, index) in billingHistory" :key="item.id">
            <div class="pa-4 d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between gap-2 hover-row">
              <div class="w-sm-25 text-body-2 font-weight-bold text-grey-darken-4">
                {{ item.date }}
              </div>
              <div class="w-sm-40 text-body-2 text-grey-medium-emphasis">
                {{ item.description }}
              </div>
              <div class="w-sm-20 text-body-2 font-weight-bold text-teal-darken-4">
                {{ item.amount }}
              </div>
              <div class="w-sm-15 text-right w-100 w-sm-auto">
                <v-btn
                  variant="text"
                  color="#00483C"
                  size="small"
                  density="comfortable"
                  class="text-none font-weight-bold"
                  @click="downloadInvoice(item)"
                >
                  <v-icon start size="16" :icon="icons.mdiDownload"></v-icon>
                  PDF
                </v-btn>
              </div>
            </div>
            <v-divider v-if="index < billingHistory.length - 1" opacity="0.12"></v-divider>
          </template>
        </v-list>

        <!-- Footer Link -->
        <div class="pa-3 text-center border-top-subtle">
          <v-btn variant="text" color="#00483C" class="text-none font-weight-bold text-caption">
            View All History
          </v-btn>
        </div>

      </v-card>
    </div>

  </v-container>
</template>

<style scoped>
.hover-row {
  transition: background-color 0.15s ease;
}
.hover-row:hover {
  background-color: rgba(0, 72, 60, 0.03);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.tracking-wider {
  letter-spacing: 0.8px;
}
.letter-spacing-widest {
  letter-spacing: 2px;
}
</style>
