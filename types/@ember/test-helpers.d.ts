declare module '@ember/test-helpers' {
  /**
   * Clicks on the specified target.
   *
   * @param target         the element or selector to click on
   * @returns              resolves when application is settled
   */
  function click(target: string | Element): Promise<void>

  /**
   * Fill the provided text into the value property (or set `.innerHTML` when the target is a content editable element) then trigger `change` and `input` events on the specified target.
   *
   * @param target         the element or selector to enter text into
   * @param text           the text to fill into the target element
   * @returns              resolves when application is settled
   */
  function fillIn(target: string | Element, text: string): Promise<void>

  /**
   * Find the first element matched by the given selector. Equivalent to calling `querySelector()` on the test root element.
   *
   * @param selector       the selector to search for
   * @returns              matched element or null
   */
  function find(selector: string): Element

  /**
   * Find all elements matched by the given selector. Equivalent to calling `querySelectorAll()` on the test root element.
   *
   * @param selector       the selector to search for
   * @returns              array of matched elements
   */
  function findAll(selector: string): Element[]

  /**
   * Navigate the application to the provided URL.
   *
   * @param route          the route to visit
   * @returns              resolves when settled
   */
  function visit(route: string): Promise<void>

  /**
   * Returns a promise to be used to pauses the current test (due to being returned from the test itself). This is useful for debugging while testing or for test-driving. It allows you to inspect the state of your application at any point.
   *
   * The test framework wrapper (e.g. `ember-qunit` or `ember-mocha`) should ensure that when pauseTest() is used, any framework specific test timeouts are disabled.
   *
   * @returns              resolves *only* when `resumeTest()` is invoked
   */
  function pauseTest(): Promise<void>

  /**
   * Resumes a test previously paused by `await pauseTest()`.
   *
   * @returns              void
   */
  function resumeTest(): void

  /**
   * Returns the application's current URL.
   *
   * @returns              the application's current url
   */
  function currentURL(): string

  /**
   * Renders the provided template and appends it to the DOM.
   * 
   * @param template the template to render
   * @returns Returns Promise<void> resolves when settled
   */
  function render(template: object): Promise<void>
}

