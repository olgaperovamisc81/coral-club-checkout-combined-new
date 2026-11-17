<script setup lang="ts">
import { computed } from 'vue'

import { useStand } from '@/stand/composables/useStand'

import Cc3ModalOrderSummaryBody from '../Modal/Cc3ModalOrderSummaryBody.vue'

/**
 * Карточка сводки внизу страницы на телефоне и планшете: миниатюры товаров,
 * их число и баллы, строки сумм и итог. Без кошелька и промокода — они стоят
 * в своей карточке ниже. С двух колонок её заменяет сводка справа.
 */
const { t } = useStand()

const text = computed(() => ({
  title: t('summary.title'),
}))
</script>

<template>
  <section class="cc3-combined-total-card">
    <h2 class="cc3-combined-total-card__title">{{ text.title }}</h2>

    <Cc3ModalOrderSummaryBody hide-promo />
  </section>
</template>

<style lang="scss">
.cc3-combined-total-card {
  @include cc3-combined-summary-card;

  &__title {
    margin: 0;
    padding: var(--st-global-distance-space-inset-sm) var(--st-global-distance-space-inset-2xl);

    @include font('heading-xxs');

    color: var(--st-content-foreground-color-neutral-primary);
  }
}
</style>
