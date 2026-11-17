<script setup lang="ts">
import { computed, ref } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

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

function onToggle(event: Event) {
  if ((event.target as HTMLInputElement).checked) {
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
    <div class="cc3-combined-wallet__head">
      <span class="cc3-combined-wallet__info">
        <span class="cc3-combined-wallet__name">
          {{ text.name }}

          <button
            type="button"
            class="cc3-combined-wallet__info-button"
            :aria-label="text.info"
            :aria-expanded="isInfoOpen"
            @click="toggleInfo"
          >
            <Cc3Icon name="info-circle" :size="16" />
          </button>
        </span>
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
  </section>
</template>

<style lang="scss">
.cc3-combined-wallet {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-inset-xl);

  // Блок стоит первым в карточке кошелька и промокода: сверху 6, чтобы вместе
  // с полем карточки получилось 24 до текста. Поля по бокам задаёт margin,
  // чтобы блок шёл по ширине строк карточки.
  margin: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-2xl);

  &__head {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-xl);
  }

  &__info {
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    @include font('body-lg');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  // Значок вопроса: без рамки и подложки, пока пояснение закрыто — приглушён.
  &__info-button {
    display: flex;

    padding: 0;

    color: var(--st-content-foreground-color-neutral-secondary);
    background: none;
    border: none;
    cursor: pointer;

    &[aria-expanded='true'] {
      color: var(--st-content-foreground-color-neutral-primary);
    }
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
    background-color: var(--st-action-background-color-positive-normal);

    &::after {
      transform: translateX(20px);
    }
  }

  &__switch-input:focus-visible + &__switch-track {
    outline: 2px solid var(--st-action-background-color-positive-normal);
    outline-offset: 2px;
  }

  // Пояснение под строкой мелким текстом, без плашки: отдельная рамка внутри
  // серой карточки выделяла бы его сильнее, чем сам блок. Внутри — одно из
  // трёх состояний блока.
  &__note {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--st-global-distance-space-inset-md);
  }

  &__description {
    margin: 0;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);

    strong {
      font-weight: 500;

      color: var(--st-content-foreground-color-neutral-primary);
    }
  }
}
</style>
