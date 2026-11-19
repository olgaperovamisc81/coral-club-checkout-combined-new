<script setup lang="ts">
import Cc3CombinedPromo from './Cc3CombinedPromo.vue'
import Cc3CombinedWallet from './Cc3CombinedWallet.vue'

/**
 * Скидки внутри серой карточки сводки: Coral Wallet (строка с переключателем)
 * и промокод (текстовая строка, которая открывает поле). Стоят между строками
 * сумм и итогом: это два способа уменьшить сумму, и итог после них.
 * Блок кошелька сам прячется, когда кошелька у человека нет, и тогда остаётся
 * один промокод.
 */
</script>

<template>
  <div class="cc3-combined-extras">
    <Cc3CombinedWallet />

    <Cc3CombinedPromo />
  </div>
</template>

<style lang="scss">
.cc3-combined-extras {
  display: flex;
  flex-direction: column;
  gap: var(--st-global-distance-space-inset-2xl);
}
</style>
