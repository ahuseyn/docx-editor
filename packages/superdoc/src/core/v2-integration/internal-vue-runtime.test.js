import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import * as Vue from 'vue';

const key = '__SUPERDOC_V2_BROWSER_RUNTIME__';
const prior = globalThis[key];
afterEach(() => {
  if (prior === undefined) delete globalThis[key];
  else globalThis[key] = prior;
  vi.resetModules();
});

describe('packaged internal Vue selection', () => {
  it('imports UI component definitions without loading Vue or requiring main entry initialization', async () => {
    delete globalThis[key];
    const runtime = await import('./internal-vue-runtime.js');
    const options = { setup: () => null };
    expect(runtime.defineComponent(options)).toBe(options);
    expect(globalThis[key]).toBeUndefined();
    expect(() => runtime.ref('value')).toThrow(/initialize SuperDoc/);
  });

  it('forwards effects to the installed runtime without replacing registry peers', async () => {
    const peer = {};
    globalThis[key] = { vue: Vue, peer };
    const runtime = await import('./internal-vue-runtime.js');
    const ref = runtime.ref(1);
    const values = [];
    const stop = Vue.watch(ref, (value) => values.push(value), { flush: 'sync' });
    ref.value = 2;
    expect(values).toEqual([2]);
    stop();
    expect(globalThis[key].vue).toBe(Vue);
    expect(globalThis[key].peer).toBe(peer);
  });

  it('renders Transition with native slots and metadata for empty and populated children', async () => {
    globalThis[key] = { vue: Vue };
    const runtime = await import('./internal-vue-runtime.js');
    expect(runtime.Transition.length).toBe(Vue.Transition.length);
    expect(runtime.Transition.props).toBe(Vue.Transition.props);
    for (const child of [null, Vue.h('span', 'visible')]) {
      const container = document.createElement('div');
      const errors = [];
      const app = Vue.createApp({ render: () => Vue.h(runtime.Transition, null, { default: () => child }) });
      app.config.errorHandler = (error) => errors.push(error);
      app.mount(container);
      await Vue.nextTick();
      expect(errors).toEqual([]);
      expect(container.textContent).toBe(child ? 'visible' : '');
      app.unmount();
    }
  });
});
