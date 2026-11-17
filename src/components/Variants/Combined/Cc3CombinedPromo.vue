<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryPromo from '../Modal/Cc3ModalOrderSummaryPromo.vue'
import Cc3CombinedToggleRow from './Cc3CombinedToggleRow.vue'

/**
 * Промокод строкой: «Промокод» тем же шрифтом, что Coral Wallet, и справа
 * плюс. Нажатие открывает под строкой поле ввода с кнопкой «Применить», плюс
 * превращается в крестик, и им поле закрывается. Применили — поле уходит,
 * под названием зелёным стоит «КОД применён!», а справа вместо плюса
 * «Удалить».
 *
 * Само поле с проверкой кода — общее (Cc3ModalOrderSummaryPromo): здесь только
 * раскрытие и снятие.
 */
const { t } = useStand()
const { appliedPromo, promoCode, removePromo, clearPromoError } = useCheckout()

const isOpen = ref(false)

// Код применили где-то ещё — поле закрывать незачем, строка покажет код.
watch(appliedPromo, (applied) => {
  if (applied) {
    isOpen.value = false
  }
})

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  promoCode.value = ''
  clearPromoError()
}

const text = computed(() => ({
  name: t('summary.promoPlaceholder'),
  close: t('common.close'),
  remove: t('summary.promoRemove'),
  applied: appliedPromo.value ? t('summary.promoApplied', { code: appliedPromo.value.code }) : '',
}))
</script>

<template>
  <section class="cc3-combined-promo">
    <Cc3CombinedToggleRow :name="text.name" :value="text.applied" is-active>
      <template #control>
        <button
          v-if="appliedPromo"
          type="button"
          class="cc3-combined-promo__remove"
          @click="removePromo"
        >
          {{ text.remove }}
        </button>

        <button
          v-else-if="isOpen"
          type="button"
          class="cc3-combined-promo__toggle"
          :aria-label="text.close"
          aria-expanded="true"
          @click="close"
        >
          <Cc3Icon name="x-md" :size="24" />
        </button>

        <button
          v-else
          type="button"
          class="cc3-combined-promo__toggle"
          :aria-label="text.name"
          aria-expanded="false"
          @click="open"
        >
          <Cc3Icon name="plus-md" :size="24" />
        </button>
      </template>

      <Cc3ModalOrderSummaryPromo v-if="isOpen && !appliedPromo" floating />
    </Cc3CombinedToggleRow>
  </section>
</template>

<style lang="scss">
.cc3-combined-promo {
  // Поля по бокам, как у блока кошелька: строки идут по ширине строк карточки.
  margin: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-2xl);

  // Следом за кошельком отступ сверху уже есть: он держит снизу свои 16.
  .cc3-combined-wallet + & {
    margin-top: 0;
  }

  // Плюс и крестик: без рамки, по размеру переключателя в высоту, чтобы строка
  // стояла так же, как строка кошелька.
  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    padding: 0;
    height: 28px;

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;
    cursor: pointer;
  }

  // «Удалить» как ссылка действия версии, того же вида, что «Изменить».
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
