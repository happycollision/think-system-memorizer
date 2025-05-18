# think-system-memorizer

https://happycollision.github.io/think-system-memorizer/#/librettos

## Running with Docker

To build and run your project in a Node.js 10 environment using Docker Compose:

```sh
docker-compose up
```

This ensures compatibility with Node.js 10 even on modern systems.

Need to run something other than `start`?

```sh
docker compose run --service-ports app bash
```

## Deployment

Ember deploy is out.

Run the `./deploy-gh-pages.sh` script directly. It will manage entering the VM
to build and then uploading and everything from in the host environment again.

## notes

Importing Happy Helpers is strangely challenging. You have to add a space after `//` in the last line.

```
CHange this:
//# sourceURL

to this:
// # sourceURL
```

Or remove the line completely.

## Installation

* `git clone <repository-url>` this repository
* `cd my-app`
* `npm install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
