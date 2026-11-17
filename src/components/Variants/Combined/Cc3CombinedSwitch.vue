<script setup lang="ts">
/**
 * Переключатель комбинированной версии: дорожка и бегунок, во включённом
 * состоянии тёмно-зелёный. Сам input скрыт и лежит поверх, дорожку и бегунок
 * рисует соседний span: псевдоэлементы у самого input рисуются не везде.
 *
 * Стоит у Coral Wallet и у промокода.
 */
defineProps<{
  /** Подпись для читалок экрана: сам переключатель текста не несёт. */
  label: string
}>()

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="cc3-combined-switch">
    <input
      v-model="model"
      type="checkbox"
      role="switch"
      class="cc3-combined-switch__input"
      :aria-label="label"
    />
    <span class="cc3-combined-switch__track" />
  </label>
</template>

<style lang="scss">
.cc3-combined-switch {
  position: relative;

  flex-shrink: 0;

  display: block;

  width: 48px;
  height: 28px;

  cursor: pointer;

  &__input {
    position: absolute;
    inset: 0;
    z-index: 1;

    margin: 0;
    width: 100%;
    height: 100%;

    opacity: 0;
    cursor: pointer;
  }

  &__track {
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

  &__input:checked + &__track {
    background-color: var(--st-action-background-color-positive-normal);

    &::after {
      transform: translateX(20px);
    }
  }

  &__input:focus-visible + &__track {
    outline: 2px solid var(--st-action-background-color-positive-normal);
    outline-offset: 2px;
  }
}
</style>
