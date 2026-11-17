<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryPromo from '../Modal/Cc3ModalOrderSummaryPromo.vue'

/**
 * Промокод текстовой строкой: слово «Промокод» тем же шрифтом, что Coral
 * Wallet, но ссылкой — зелёным с пунктиром, как «Применить». Нажатие открывает
 * под ним поле ввода, повторное закрывает. Применили — поле уходит, на месте
 * ссылки обычное «Промокод» с зелёным «КОД применён!» под ним, а справа
 * «Удалить».
 *
 * Иконок нет: строка читается как текст-действие. Само поле с проверкой кода
 * — общее (Cc3ModalOrderSummaryPromo): здесь только раскрытие и снятие.
 */
const { t } = useStand()
const { appliedPromo, promoCode, removePromo, clearPromoError } = useCheckout()

const isOpen = ref(false)

// Код применили — поле закрывать незачем, строка покажет код.
watch(appliedPromo, (applied) => {
  if (applied) {
    isOpen.value = false
  }
})

function toggle() {
  isOpen.value = !isOpen.value

  if (!isOpen.value) {
    promoCode.value = ''
    clearPromoError()
  }
}

const text = computed(() => ({
  name: t('summary.promoPlaceholder'),
  remove: t('summary.promoRemove'),
  applied: appliedPromo.value ? t('summary.promoApplied', { code: appliedPromo.value.code }) : '',
}))
</script>

<template>
  <section class="cc3-combined-promo">
    <div class="cc3-combined-promo__head">
      <span v-if="appliedPromo" class="cc3-combined-promo__info">
        <span class="cc3-combined-promo__name">{{ text.name }}</span>
        <span class="cc3-combined-promo__applied">{{ text.applied }}</span>
      </span>

      <button
        v-else
        type="button"
        class="cc3-combined-promo__link"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        {{ text.name }}
      </button>

      <button
        v-if="appliedPromo"
        type="button"
        class="cc3-combined-promo__remove"
        @click="removePromo"
      >
        {{ text.remove }}
      </button>
    </div>

    <Cc3ModalOrderSummaryPromo v-if="isOpen && !appliedPromo" floating />
  </section>
</template>

<style lang="scss">
.cc3-combined-promo {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-inset-xl);

  // Поля по бокам, как у блока кошелька: строки идут по ширине строк карточки.
  margin: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-2xl);

  // Следом за кошельком отступ сверху уже есть: он держит снизу свои 16.
  .cc3-combined-wallet + & {
    margin-top: 0;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--st-global-distance-space-inset-xl);
  }

  &__info {
    display: flex;
    flex-direction: column;

    min-width: 0;
  }

  // Название тем же шрифтом, что у Coral Wallet.
  &__name,
  &__link {
    @include font('body-lg');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  // Ссылка-действие: зелёная с пунктиром, как «Применить».
  &__link {
    padding: 0;

    font-family: inherit;

    color: var(--st-action-foreground-color-positive-normal);
    text-decoration: underline dotted;
    text-underline-offset: 4px;
    background: none;
    border: none;
    cursor: pointer;
  }

  &__applied {
    @include font('body-sm');

    color: var(--st-content-foreground-color-positive-secondary);
  }

  // «Удалить» тем же видом, что ссылки действий версии.
  &__remove {
    flex-shrink: 0;

    padding: 0;

    @include font('label-sm');

    color: var(--st-action-foreground-color-positive-normal);
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
  }
}
</style>
