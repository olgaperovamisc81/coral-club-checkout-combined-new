<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

import Cc3Icon from '@/components/Icon/Cc3Icon.vue'
import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryPromo from '../Modal/Cc3ModalOrderSummaryPromo.vue'

/**
 * Промокод: ссылка «У меня есть промокод» со значком процента слева, чёрная,
 * средним шрифтом, с пунктиром под текстом. Нажатие заменяет ссылку полем ввода с кнопкой «Применить», и курсор сразу в нём.
 * Если из пустого поля вышли, поле снова становится ссылкой. Применили —
 * поле уходит, остаётся «Промокод» с зелёным «КОД применён!» под ним и
 * «Удалить» справа.
 *
 * Само поле с проверкой кода — общее (Cc3ModalOrderSummaryPromo): здесь только
 * раскрытие и снятие.
 */
const { t } = useStand()
const { appliedPromo, promoCode, removePromo, clearPromoError } = useCheckout()

const rootRef = ref<HTMLElement>()
const isOpen = ref(false)

// Код применили — поле закрывать незачем, строка покажет код.
watch(appliedPromo, (applied) => {
  if (applied) {
    isOpen.value = false
  }
})

async function open() {
  isOpen.value = true

  await nextTick()

  rootRef.value?.querySelector('input')?.focus()
}

// Вышли из поля, ничего не введя, — возвращаем ссылку. С введённым кодом поле
// остаётся: человек мог пойти за кнопкой «Применить» или отвлечься.
function onFocusOut(event: FocusEvent) {
  // Только выход из самого поля: ссылка, которую заменило поле, тоже
  // «теряет фокус», и без этой проверки поле закрывалось бы сразу после открытия.
  if ((event.target as HTMLElement).tagName !== 'INPUT') {
    return
  }

  if (rootRef.value?.contains(event.relatedTarget as Node | null)) {
    return
  }

  if (isOpen.value && !promoCode.value.trim()) {
    isOpen.value = false
    clearPromoError()
  }
}

const text = computed(() => ({
  name: t('summary.promoPlaceholder'),
  have: t('summary.promoHave'),
  remove: t('summary.promoRemove'),
  applied: appliedPromo.value ? t('summary.promoApplied', { code: appliedPromo.value.code }) : '',
}))
</script>

<template>
  <section ref="rootRef" class="cc3-combined-promo" @focusout="onFocusOut">
    <div v-if="appliedPromo" class="cc3-combined-promo__head">
      <Cc3Icon name="percent-square" :size="24" class="cc3-combined-promo__icon" />

      <span class="cc3-combined-promo__info">
        <span class="cc3-combined-promo__name">{{ text.name }}</span>
        <span class="cc3-combined-promo__applied">{{ text.applied }}</span>
      </span>

      <button type="button" class="cc3-combined-promo__remove" @click="removePromo">
        {{ text.remove }}
      </button>
    </div>

    <Cc3ModalOrderSummaryPromo v-else-if="isOpen" floating />

    <button v-else type="button" class="cc3-combined-promo__link" @click="open">
      <Cc3Icon name="percent-square" :size="24" />

      <span class="cc3-combined-promo__link-text">{{ text.have }}</span>
    </button>
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
    gap: var(--st-global-distance-space-inset-md);
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

  // Название применённого кода тем же шрифтом, что у Coral Wallet.
  &__name {
    @include font('body-lg');

    color: var(--st-content-foreground-color-neutral-primary);
  }

  // Ссылка «У меня есть промокод»: значок слева, текст чёрным средним
  // шрифтом, под текстом пунктир (под значком его нет).
  &__link {
    display: flex;
    align-self: flex-start;
    align-items: center;
    gap: var(--st-global-distance-space-inset-md);

    padding: 0;

    font-family: inherit;

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;
    cursor: pointer;
  }

  &__link-text {
    @include font('label-lg');

    text-decoration: underline dotted;
    text-underline-offset: 6px;
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
