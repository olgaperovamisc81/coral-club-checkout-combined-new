<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Cc3InputField from '@/components/Field/Cc3InputField.vue'
import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

/**
 * Блок Coral Wallet над способами оплаты: строка с иконкой, балансом и
 * переключателем и под ней зелёная плашка с пояснением. Баланс меньше
 * заказа, поэтому сценарий один: списать баланс скидкой (всё доступное или
 * свою сумму), а остаток оплатить обычным способом ниже. Блок виден только
 * тому, у кого есть кошелёк, — человеку с сохранёнными адресами; новый
 * покупатель кошелька ещё не имеет.
 *
 * Переключатель включает скидку на всё доступное и выключает её. Свою
 * сумму вводят в плашке: пока она не применена, переключатель выключен.
 * Состояния: до применения, ввод своей суммы и после применения (сколько
 * списано и сколько осталось оплатить). Скидка пересчитывается сама: цена
 * товаров, доставка и промокод меняют итог, а сообщение и сводка берут
 * сумму из общего состояния заказа.
 */
const { t, hasSavedAddresses } = useStand()

const {
  walletMode,
  walletCustomAmount,
  isWalletAvailable,
  isWalletFullyCovering,
  isOrderFullyPaidByWallet,
  isWalletCustomAmountValid,
  walletDisplayBalanceFormat,
  walletMaxUsableFormat,
  walletAppliedAmountFormat,
  walletRemainingToPayFormat,
  applyWalletFullDiscount,
  openWalletCustomAmount,
  applyWalletCustomAmount,
  removeWalletDiscount,
} = useCheckout()

const isVisible = computed(
  () => hasSavedAddresses.value && (isWalletAvailable.value || walletMode.value === 'applied'),
)

// Название сервиса — имя собственное, не переводится.
const WALLET_NAME = 'Coral Wallet'

const isApplied = computed(() => walletMode.value === 'applied')

// Под названием стоит баланс, а после применения — сколько списано.
const value = computed(() =>
  isApplied.value
    ? `−${walletAppliedAmountFormat.value}`
    : walletDisplayBalanceFormat.value,
)

function onToggle(event: Event) {
  if ((event.target as HTMLInputElement).checked) {
    applyWalletFullDiscount()
  } else {
    removeWalletDiscount()
  }
}

const text = computed(() => ({
  name: WALLET_NAME,
  payAll: t('wallet.payAll'),
  spendUpTo: t('wallet.spendUpTo', { amount: walletMaxUsableFormat.value }),
  otherAmount: t('wallet.otherAmount'),
  applyDiscount: t('wallet.applyDiscount'),
  question: t('wallet.question'),
  enterAmount: t('wallet.enterAmount'),
  max: t('wallet.max', { amount: walletMaxUsableFormat.value }),
  amountError: t('wallet.amountError', { amount: walletMaxUsableFormat.value }),
  applied: t('wallet.applied', { amount: walletAppliedAmountFormat.value }),
  remaining: t('wallet.remaining', { amount: walletRemainingToPayFormat.value }),
  fullyCovered: t('wallet.fullyCovered'),
}))

// Кнопка «Применить» не гаснет молча: с неверной суммой она показывает, что
// не так. Ошибка уходит, как только сумму начинают править.
const isAmountTried = ref(false)

const hint = computed(() =>
  isAmountTried.value && !isWalletCustomAmountValid.value ? text.value.amountError : text.value.max,
)

const isAmountInvalid = computed(() => isAmountTried.value && !isWalletCustomAmountValid.value)

watch(walletCustomAmount, () => {
  isAmountTried.value = false
})

function applyCustom() {
  if (!isWalletCustomAmountValid.value) {
    isAmountTried.value = true

    return
  }

  applyWalletCustomAmount()
}
</script>

<template>
  <section v-if="isVisible" class="cc3-combined-wallet">
    <div class="cc3-combined-wallet__head">
      <Cc3Icon name="wallet-02" :size="24" class="cc3-combined-wallet__icon" />

      <span class="cc3-combined-wallet__info">
        <span class="cc3-combined-wallet__name">{{ text.name }}</span>
        <span
          class="cc3-combined-wallet__value"
          :class="{ 'cc3-combined-wallet__value--applied': isApplied }"
        >
          {{ value }}
        </span>
      </span>

      <label class="cc3-combined-wallet__switch">
        <input
          type="checkbox"
          role="switch"
          class="cc3-combined-wallet__switch-input"
          :checked="isApplied"
          :aria-label="text.name"
          @change="onToggle"
        />
        <span class="cc3-combined-wallet__switch-track" />
      </label>
    </div>

    <div class="cc3-combined-wallet__note">
      <!-- Скидка ещё не применена: предлагаем списать доступный баланс. -->
      <template v-if="walletMode === 'idle'">
        <p class="cc3-combined-wallet__description">
          <template v-if="isWalletFullyCovering">{{ text.payAll }}</template>
          <template v-else>{{ text.spendUpTo }}</template>
        </p>

        <button type="button" class="cc3-combined-wallet__link" @click="openWalletCustomAmount">
          {{ text.otherAmount }}
        </button>
      </template>

      <!-- Своя сумма. -->
      <template v-else-if="walletMode === 'custom'">
        <p class="cc3-combined-wallet__description">{{ text.question }}</p>

        <div class="cc3-combined-wallet__field">
          <Cc3InputField
            v-model="walletCustomAmount"
            type="text"
            inputmode="numeric"
            :placeholder="text.enterAmount"
            :aria-label="text.enterAmount"
          />

          <span
            class="cc3-combined-wallet__hint"
            :class="{ 'cc3-combined-wallet__hint--error': isAmountInvalid }"
            :role="isAmountInvalid ? 'alert' : undefined"
          >
            {{ hint }}
          </span>
        </div>

        <button type="button" class="cc3-combined-wallet__apply" @click="applyCustom">
          {{ text.applyDiscount }}
        </button>
      </template>

      <!-- Скидка применена: сколько списано и сколько осталось оплатить. -->
      <template v-else>
        <p class="cc3-combined-wallet__description">
          {{ text.applied }}
          <strong v-if="isOrderFullyPaidByWallet">{{ text.fullyCovered }}</strong>
          <strong v-else>{{ text.remaining }}</strong>
        </p>
      </template>
    </div>
  </section>
</template>

<style lang="scss">
.cc3-combined-wallet {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-inset-xl);

  // Блок стоит внутри сводки под итогом, отделён от него линией. Поля по
  // бокам задаёт margin: линия идёт по ширине строк сводки.
  margin: var(--st-global-distance-space-inset-xl) var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-2xl);
  padding-top: var(--st-global-distance-space-inset-2xl);

  border-top: 1px solid var(--st-content-border-color-neutral-implicit);

  &__head {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-xl);
  }

  &__icon {
    flex-shrink: 0;

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__info {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
  }

  &__name {
    @include font('body-lg');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  &__value {
    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);

    &--applied {
      color: var(--st-content-foreground-color-positive-secondary);
    }
  }

  // Переключатель: сам input скрыт, дорожку и бегунок рисует соседний span.
  // Псевдоэлементы у самого input не везде рисуются, поэтому отдельный элемент.
  &__switch {
    position: relative;

    flex-shrink: 0;

    display: block;

    width: 48px;
    height: 28px;

    cursor: pointer;
  }

  &__switch-input {
    position: absolute;
    inset: 0;
    z-index: 1;

    margin: 0;
    width: 100%;
    height: 100%;

    opacity: 0;
    cursor: pointer;
  }

  &__switch-track {
    position: absolute;
    inset: 0;

    background-color: var(--st-content-background-color-neutral-mute);
    border-radius: var(--st-global-radius-pill);
    transition: background-color 0.15s ease;

    &::after {
      content: '';

      position: absolute;
      top: var(--st-global-distance-space-inset-xs);
      left: var(--st-global-distance-space-inset-xs);

      width: 20px;
      height: 20px;

      background-color: var(--st-content-background-color-default-solid-normal);
      border-radius: var(--st-global-radius-pill);
      box-shadow: 0 1px 3px 0 rgb(4 8 13 / 24%);
      transition: transform 0.15s ease;
    }
  }

  &__switch-input:checked + &__switch-track {
    background-color: var(--st-action-background-color-primary-solid-normal);

    &::after {
      transform: translateX(20px);
    }
  }

  &__switch-input:focus-visible + &__switch-track {
    outline: 2px solid var(--st-action-background-color-positive-normal);
    outline-offset: 2px;
  }

  // Зелёная плашка с пояснением под строкой. Внутри — одно из трёх
  // состояний блока.
  &__note {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-2xl);

    background-color: var(--st-content-background-color-positive-subtle);
    border: 1px solid var(--st-content-border-color-positive-implicit);
    border-radius: var(--st-global-radius-xl);
  }

  &__description {
    margin: 0;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);

    strong {
      font-weight: 700;
    }
  }

  &__link {
    align-self: flex-start;

    padding: 0;

    font-family: inherit;

    @include font('label-sm');

    color: var(--st-content-foreground-color-neutral-secondary);
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-sm);
  }

  &__hint {
    @include font('body-sm');

    color: var(--st-content-foreground-color-neutral-secondary);

    &--error {
      color: var(--st-content-foreground-color-negative-primary);
    }
  }

  // «Применить» для своей суммы — второстепенная кнопка (светлая заливка):
  // главное действие страницы — оплата внизу.
  &__apply {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--st-global-distance-space-inset-xl);
    width: 100%;

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-positive-normal);
    background-color: var(--st-content-background-color-default-solid-normal);
    border: none;
    border-radius: var(--st-global-radius-pill);
    cursor: pointer;
  }
}
</style>
