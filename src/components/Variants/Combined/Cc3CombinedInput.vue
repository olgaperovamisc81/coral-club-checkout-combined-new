<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Поле ввода комбинированной версии с подписью внутри. Пока поле пустое и не
 * в фокусе, подпись стоит по центру как подсказка; с фокусом или значением
 * она уходит вверх и уменьшается, а текст остаётся под ней.
 *
 * Тот же вид и поведение, что у полей формы адреса (они рисуются полем
 * стенда): высота 52, рамка 1px, скругление 12, серый фон и рамка в фокусе.
 * Нужно для полей, которые не приходят из конфига стенда: поиск адреса,
 * поиск пунктов выдачи, промокод.
 *
 * Слот `prefix` — значок слева (лупа), слот `action` — кнопка справа
 * («Применить», сброс). Остальные атрибуты (обработчики focus, keydown,
 * aria-*) уходят на сам input.
 */
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    label: string
    type?: string
    inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search' | 'none'
    autocomplete?: string
    readonly?: boolean
    invalid?: boolean
  }>(),
  {
    type: 'text',
    inputmode: undefined,
    autocomplete: 'off',
    readonly: false,
    invalid: false,
  },
)

const model = defineModel<string>({ default: '' })

const isFocused = ref(false)

// Подпись поднята, пока в поле что-то есть или оно в фокусе.
const isLifted = computed(() => isFocused.value || model.value !== '')
</script>

<template>
  <label
    class="cc3-combined-input"
    :class="{
      'cc3-combined-input--lifted': isLifted,
      'cc3-combined-input--invalid': invalid,
      'cc3-combined-input--readonly': readonly,
    }"
  >
    <span class="cc3-combined-input__prefix"><slot name="prefix" /></span>

    <span class="cc3-combined-input__label">{{ label }}</span>

    <input
      v-bind="$attrs"
      v-model="model"
      :type="type"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :readonly="readonly"
      class="cc3-combined-input__control"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <span class="cc3-combined-input__action"><slot name="action" /></span>
  </label>
</template>

<style lang="scss">
.cc3-combined-input {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;

  padding: 0 var(--st-global-distance-space-inset-2xl);
  width: 100%;
  height: 52px;

  background-color: var(--st-content-background-color-neutral-primary);
  border: 1px solid var(--st-content-border-color-neutral-implicit);
  border-radius: var(--st-global-radius-xl);
  cursor: text;

  &:hover {
    background-color: var(--st-content-background-color-neutral-subtle);
    border-color: var(--st-content-border-color-neutral-disable);
  }

  // #A0ADB7 — цвет из референса, точного токена ДС под него нет; тот же, что
  // у остальных полей версии.
  &:focus-within {
    background-color: var(--st-content-background-color-neutral-subtle);
    border-color: #a0adb7;
  }

  &--invalid,
  &--invalid:hover,
  &--invalid:focus-within {
    border-color: var(--st-content-border-color-negative-explicit);
  }

  // Значок и кнопка занимают свои колонки, а подпись и текст делят вторую
  // ячейку: подпись сверху, текст под ней.
  &__prefix {
    display: flex;
    grid-column: 1;

    color: var(--st-content-foreground-color-neutral-secondary);

    &:not(:empty) {
      margin-inline-end: var(--st-global-distance-space-inset-md);
    }
  }

  &__action {
    grid-column: 3;
  }

  &__label {
    grid-area: 1 / 2;
    align-self: start;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-secondary);
    pointer-events: none;
    transform: translateY(16px);
    transition:
      transform 0.15s ease,
      font-size 0.15s ease,
      line-height 0.15s ease;
    z-index: 1;
  }

  &--lifted &__label {
    @include font('label-xs');

    transform: translateY(6px);
  }

  &__control {
    grid-area: 1 / 2;

    padding: 18px 0 0;
    width: 100%;
    height: 100%;

    font-family: inherit;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);
    background: none;
    border: none;
    cursor: inherit;
    text-overflow: ellipsis;

    &:focus {
      outline: none;
    }
  }
}
</style>
