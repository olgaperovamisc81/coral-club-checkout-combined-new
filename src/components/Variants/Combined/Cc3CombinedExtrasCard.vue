<script setup lang="ts">
import Cc3CombinedPromo from './Cc3CombinedPromo.vue'
import Cc3CombinedWallet from './Cc3CombinedWallet.vue'

/**
 * Карточка под сводкой: Coral Wallet и промокод, оба строкой с переключателем. Это два
 * способа уменьшить сумму, и они стоят отдельно от самой сводки, как вторая
 * карточка в чекаутах с бонусами и рассрочкой. Блок кошелька сам прячется,
 * когда кошелька у человека нет, и тогда в карточке остаётся один промокод.
 *
 * Карточка без серой заливки, только с обводкой: сводка остаётся серой, а
 * скидки лежат на белом и не спорят с ней по весу.
 */
</script>

<template>
  <section class="cc3-combined-extras-card">
    <Cc3CombinedWallet />

    <Cc3CombinedPromo />
  </section>
</template>

<style lang="scss">
.cc3-combined-extras-card {
  @include cc3-combined-summary-card;

  // Без заливки, только обводка.
  background-color: transparent;
  border: 1px solid var(--st-content-border-color-neutral-implicit);
}
</style>
