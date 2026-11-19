<script setup lang="ts">
import { computed, ref } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3CombinedToggleRow from './Cc3CombinedToggleRow.vue'

/**
 * Блок Coral Wallet над способами оплаты: строка с балансом и
 * переключателем; пояснение спрятано за значком вопроса и раскрывается под строкой мелким текстом. Баланс меньше
 * заказа, поэтому сценарий один: списать весь доступный баланс скидкой, а
 * остаток оплатить обычным способом ниже. Блок виден только тому, у кого
 * есть кошелёк, — человеку с сохранёнными адресами; новый покупатель
 * кошелька ещё не имеет.
 *
 * Переключатель включает скидку на всё доступное и выключает её. Своей
 * суммы нет: списывается всё, что можно. Состояния: до применения и после
 * (сколько списано и сколько осталось оплатить). Скидка пересчитывается
 * сама: цена товаров, доставка и промокод меняют итог, а сообщение и
 * сводка берут сумму из общего состояния заказа.
 */
const { t, hasSavedAddresses } = useStand()

const {
  walletMode,
  isWalletAvailable,
  isWalletFullyCovering,
  isOrderFullyPaidByWallet,
  walletDisplayBalanceFormat,
  walletMaxUsableFormat,
  walletAppliedAmountFormat,
  walletRemainingToPayFormat,
  applyWalletFullDiscount,
  removeWalletDiscount,
} = useCheckout()

const isVisible = computed(
  () => hasSavedAddresses.value && (isWalletAvailable.value || walletMode.value === 'applied'),
)

// Название сервиса — имя собственное, не переводится.
const WALLET_NAME = 'Coral Wallet'

const isApplied = computed(() => walletMode.value === 'applied')

// Пояснение спрятано за значком вопроса и раскрывается по нажатию.
const isInfoOpen = ref(false)

function toggleInfo() {
  isInfoOpen.value = !isInfoOpen.value
}

// Под названием стоит баланс, а после применения — сколько списано.
const value = computed(() =>
  isApplied.value
    ? `${t('wallet.appliedLabel')} ${walletAppliedAmountFormat.value}`
    : `${t('wallet.available')} ${walletDisplayBalanceFormat.value}`,
)

function onToggle(isOn: boolean) {
  if (isOn) {
    applyWalletFullDiscount()
  } else {
    removeWalletDiscount()
  }
}

const text = computed(() => ({
  name: WALLET_NAME,
  info: t('wallet.info'),
  payAll: t('wallet.payAll'),
  spendUpTo: t('wallet.spendUpTo', { amount: walletMaxUsableFormat.value }),
  applied: t('wallet.applied', { amount: walletAppliedAmountFormat.value }),
  remaining: t('wallet.remaining', { amount: walletRemainingToPayFormat.value }),
  fullyCovered: t('wallet.fullyCovered'),
}))
</script>

<template>
  <section v-if="isVisible" class="cc3-combined-wallet">
    <Cc3CombinedToggleRow
      :model-value="isApplied"
      :name="text.name"
      :value="value"
      :is-active="isApplied"
      @update:model-value="onToggle"
    >
      <template #leading>
        <Cc3Icon name="wallet-02" :size="24" />
      </template>

      <template #name-extra>
        <button
          type="button"
          class="cc3-combined-wallet__info-button"
          :aria-label="text.info"
          :aria-expanded="isInfoOpen"
          @click="toggleInfo"
        >
          <Cc3Icon name="info-circle" :size="16" />
        </button>
      </template>

      <div v-if="isInfoOpen" class="cc3-combined-wallet__note">
        <!-- Скидка ещё не применена: предлагаем списать доступный баланс. -->
        <p v-if="walletMode === 'idle'" class="cc3-combined-wallet__description">
          <template v-if="isWalletFullyCovering">{{ text.payAll }}</template>
          <template v-else>{{ text.spendUpTo }}</template>
        </p>

        <!-- Скидка применена: сколько списано и сколько осталось оплатить. -->
        <p v-else class="cc3-combined-wallet__description">
          {{ text.applied }}
          <strong v-if="isOrderFullyPaidByWallet">{{ text.fullyCovered }}</strong>
          <strong v-else>{{ text.remaining }}</strong>
        </p>
      </div>
    </Cc3CombinedToggleRow>
  </section>
</template>

<style lang="scss">
.cc3-combined-wallet {
  // Поля и промежутки задаёт блок скидок, в который кошелёк входит.
  margin: 0;

  &__info-button {
    @include cc3-combined-info-button;
  }

  // Пояснение под строкой мелким текстом, без плашки: отдельная рамка внутри
  // серой карточки выделяла бы его сильнее, чем сам блок.
  &__note {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__description {
    margin: 0;

    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);

    strong {
      font-weight: 500;

      color: var(--st-content-foreground-color-neutral-primary);
    }
  }
}
</style>
