<script setup lang="ts">
import Cc3ModalOrderSummaryPromo from '../Modal/Cc3ModalOrderSummaryPromo.vue'
import Cc3CombinedWallet from './Cc3CombinedWallet.vue'

/**
 * Карточка под сводкой: Coral Wallet (строка с переключателем) и промокод
 * полем ввода. Это два способа уменьшить сумму, и они стоят отдельно от
 * самой сводки, как вторая карточка в чекаутах с бонусами и рассрочкой.
 * Блок кошелька сам прячется, когда кошелька у человека нет, и тогда в
 * карточке остаётся один промокод.
 *
 * Карточка без серой заливки, только с обводкой: сводка остаётся серой, а
 * скидки лежат на белом и не спорят с ней по весу.
 */
</script>

<template>
  <section class="cc3-combined-extras-card">
    <Cc3CombinedWallet />

    <div class="cc3-combined-extras-card__promo">
      <Cc3ModalOrderSummaryPromo floating />
    </div>
  </section>
</template>

<style lang="scss">
.cc3-combined-extras-card {
  @include cc3-combined-summary-card;

  // Без заливки, только обводка.
  background-color: transparent;
  border: 1px solid var(--st-content-border-color-neutral-implicit);

  &__promo {
    padding: 0 var(--st-global-distance-space-inset-2xl) var(--st-global-distance-space-inset-2xl);
  }
}
</style>
