<script setup lang="ts">
import Cc3ModalOrderSummaryBody from '../Modal/Cc3ModalOrderSummaryBody.vue'
import Cc3ModalOrderSummaryPromo from '../Modal/Cc3ModalOrderSummaryPromo.vue'
import Cc3CombinedOrderItems from './Cc3CombinedOrderItems.vue'
import Cc3CombinedSummaryTotal from './Cc3CombinedSummaryTotal.vue'
import Cc3CombinedWallet from './Cc3CombinedWallet.vue'

/**
 * Серая карточка сводки: плитки товаров, строка с числом товаров и баллами,
 * строки сумм и итог. Стоит и внизу страницы на телефоне, и справа на десктопе.
 *
 * Без флага `merged` кошелёк и промокод стоят в своей карточке рядом. С флагом
 * они переезжают внутрь: после строк сумм идёт блок скидок (кошелёк и
 * промокод-поле), а «Итого» — последней строкой, как в чеке.
 */
defineProps<{
  merged?: boolean
}>()
</script>

<template>
  <section class="cc3-combined-total-card">
    <Cc3CombinedOrderItems />

    <Cc3ModalOrderSummaryBody hide-items hide-promo :hide-total="merged" />

    <template v-if="merged">
      <div class="cc3-combined-total-card__controls">
        <Cc3CombinedWallet />

        <Cc3ModalOrderSummaryPromo floating />
      </div>

      <Cc3CombinedSummaryTotal />
    </template>
  </section>
</template>

<style lang="scss">
.cc3-combined-total-card {
  @include cc3-combined-summary-card;

  // Блок скидок внутри карточки: тонкая линия отделяет его от строк сумм,
  // а поля по бокам совпадают с полями самих строк.
  &__controls {
    display: flex;
    flex-direction: column;
    gap: var(--st-global-distance-space-inset-xl);

    margin: var(--st-global-distance-space-inset-xs) var(--st-global-distance-space-inset-2xl) 0;
    padding-top: var(--st-global-distance-space-inset-2xl);

    border-top: 1px solid var(--st-content-border-color-neutral-implicit);

    // У кошелька свои поля под отдельную карточку; здесь их задаёт блок.
    .cc3-combined-wallet {
      margin: 0;
    }
  }
}
</style>
