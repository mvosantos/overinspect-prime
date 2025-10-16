(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/react/cjs/react.development.js
  var require_react_development = __commonJS({
    "node_modules/react/cjs/react.development.js"(exports, module) {
      "use strict";
      (function() {
        function defineDeprecationWarning(methodName, info) {
          Object.defineProperty(Component.prototype, methodName, {
            get: function() {
              console.warn(
                "%s(...) is deprecated in plain JavaScript React classes. %s",
                info[0],
                info[1]
              );
            }
          });
        }
        function getIteratorFn(maybeIterable) {
          if (null === maybeIterable || "object" !== typeof maybeIterable)
            return null;
          maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
          return "function" === typeof maybeIterable ? maybeIterable : null;
        }
        function warnNoop(publicInstance, callerName) {
          publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
          var warningKey = publicInstance + "." + callerName;
          didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
            "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
            callerName,
            publicInstance
          ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        function ComponentDummy() {
        }
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        function noop2() {
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          try {
            testStringCoercion(value);
            var JSCompiler_inline_result = false;
          } catch (e2) {
            JSCompiler_inline_result = true;
          }
          if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(
              JSCompiler_inline_result,
              "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
              JSCompiler_inline_result$jscomp$0
            );
            return testStringCoercion(value);
          }
        }
        function getComponentNameFromType(type) {
          if (null == type) return null;
          if ("function" === typeof type)
            return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
          if ("string" === typeof type) return type;
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
              return "Activity";
          }
          if ("object" === typeof type)
            switch ("number" === typeof type.tag && console.error(
              "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
            ), type.$$typeof) {
              case REACT_PORTAL_TYPE:
                return "Portal";
              case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
              case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
              case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
              case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                  return getComponentNameFromType(type(innerType));
                } catch (x) {
                }
            }
          return null;
        }
        function getTaskName(type) {
          if (type === REACT_FRAGMENT_TYPE) return "<>";
          if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
            return "<...>";
          try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
          } catch (x) {
            return "<...>";
          }
        }
        function getOwner() {
          var dispatcher = ReactSharedInternals.A;
          return null === dispatcher ? null : dispatcher.getOwner();
        }
        function UnknownOwner() {
          return Error("react-stack-top-frame");
        }
        function hasValidKey(config) {
          if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return false;
          }
          return void 0 !== config.key;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
              "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
              displayName
            ));
          }
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function elementRefGetterWithDeprecationWarning() {
          var componentName = getComponentNameFromType(this.type);
          didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
            "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
          ));
          componentName = this.props.ref;
          return void 0 !== componentName ? componentName : null;
        }
        function ReactElement(type, key, props, owner, debugStack, debugTask) {
          var refProp = props.ref;
          type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type,
            key,
            props,
            _owner: owner
          };
          null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: false,
            get: elementRefGetterWithDeprecationWarning
          }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
          type._store = {};
          Object.defineProperty(type._store, "validated", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: 0
          });
          Object.defineProperty(type, "_debugInfo", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: null
          });
          Object.defineProperty(type, "_debugStack", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: debugStack
          });
          Object.defineProperty(type, "_debugTask", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: debugTask
          });
          Object.freeze && (Object.freeze(type.props), Object.freeze(type));
          return type;
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          newKey = ReactElement(
            oldElement.type,
            newKey,
            oldElement.props,
            oldElement._owner,
            oldElement._debugStack,
            oldElement._debugTask
          );
          oldElement._store && (newKey._store.validated = oldElement._store.validated);
          return newKey;
        }
        function validateChildKeys(node) {
          isValidElement2(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement2(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
        }
        function isValidElement2(object) {
          return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function escape2(key) {
          var escaperLookup = { "=": "=0", ":": "=2" };
          return "$" + key.replace(/[=:]/g, function(match) {
            return escaperLookup[match];
          });
        }
        function getElementKey(element, index) {
          return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape2("" + element.key)) : index.toString(36);
        }
        function resolveThenable(thenable) {
          switch (thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
            default:
              switch ("string" === typeof thenable.status ? thenable.then(noop2, noop2) : (thenable.status = "pending", thenable.then(
                function(fulfilledValue) {
                  "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
                },
                function(error) {
                  "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
                }
              )), thenable.status) {
                case "fulfilled":
                  return thenable.value;
                case "rejected":
                  throw thenable.reason;
              }
          }
          throw thenable;
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if ("undefined" === type || "boolean" === type) children = null;
          var invokeCallback = false;
          if (null === children) invokeCallback = true;
          else
            switch (type) {
              case "bigint":
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                    break;
                  case REACT_LAZY_TYPE:
                    return invokeCallback = children._init, mapIntoArray(
                      invokeCallback(children._payload),
                      array,
                      escapedPrefix,
                      nameSoFar,
                      callback
                    );
                }
            }
          if (invokeCallback) {
            invokeCallback = children;
            callback = callback(invokeCallback);
            var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
            isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
              return c;
            })) : null != callback && (isValidElement2(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
              callback,
              escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
                userProvidedKeyEscapeRegex,
                "$&/"
              ) + "/") + childKey
            ), "" !== nameSoFar && null != invokeCallback && isValidElement2(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
            return 1;
          }
          invokeCallback = 0;
          childKey = "" === nameSoFar ? "." : nameSoFar + ":";
          if (isArrayImpl(children))
            for (var i = 0; i < children.length; i++)
              nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
                nameSoFar,
                array,
                escapedPrefix,
                type,
                callback
              );
          else if (i = getIteratorFn(children), "function" === typeof i)
            for (i === children.entries && (didWarnAboutMaps || console.warn(
              "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
            ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
              nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
                nameSoFar,
                array,
                escapedPrefix,
                type,
                callback
              );
          else if ("object" === type) {
            if ("function" === typeof children.then)
              return mapIntoArray(
                resolveThenable(children),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              );
            array = String(children);
            throw Error(
              "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
            );
          }
          return invokeCallback;
        }
        function mapChildren(children, func, context) {
          if (null == children) return children;
          var result = [], count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function lazyInitializer(payload) {
          if (-1 === payload._status) {
            var ioInfo = payload._ioInfo;
            null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
            ioInfo = payload._result;
            var thenable = ioInfo();
            thenable.then(
              function(moduleObject) {
                if (0 === payload._status || -1 === payload._status) {
                  payload._status = 1;
                  payload._result = moduleObject;
                  var _ioInfo = payload._ioInfo;
                  null != _ioInfo && (_ioInfo.end = performance.now());
                  void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
                }
              },
              function(error) {
                if (0 === payload._status || -1 === payload._status) {
                  payload._status = 2;
                  payload._result = error;
                  var _ioInfo2 = payload._ioInfo;
                  null != _ioInfo2 && (_ioInfo2.end = performance.now());
                  void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
                }
              }
            );
            ioInfo = payload._ioInfo;
            if (null != ioInfo) {
              ioInfo.value = thenable;
              var displayName = thenable.displayName;
              "string" === typeof displayName && (ioInfo.name = displayName);
            }
            -1 === payload._status && (payload._status = 0, payload._result = thenable);
          }
          if (1 === payload._status)
            return ioInfo = payload._result, void 0 === ioInfo && console.error(
              "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
              ioInfo
            ), "default" in ioInfo || console.error(
              "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
              ioInfo
            ), ioInfo.default;
          throw payload._result;
        }
        function resolveDispatcher() {
          var dispatcher = ReactSharedInternals.H;
          null === dispatcher && console.error(
            "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
          );
          return dispatcher;
        }
        function releaseAsyncTransition() {
          ReactSharedInternals.asyncTransitions--;
        }
        function enqueueTask(task) {
          if (null === enqueueTaskImpl)
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              enqueueTaskImpl = (module && module[requireString]).call(
                module,
                "timers"
              ).setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                  "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
                ));
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          return enqueueTaskImpl(task);
        }
        function aggregateErrors(errors) {
          return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
        }
        function popActScope(prevActQueue, prevActScopeDepth) {
          prevActScopeDepth !== actScopeDepth - 1 && console.error(
            "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
          );
          actScopeDepth = prevActScopeDepth;
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          var queue = ReactSharedInternals.actQueue;
          if (null !== queue)
            if (0 !== queue.length)
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                });
                return;
              } catch (error) {
                ReactSharedInternals.thrownErrors.push(error);
              }
            else ReactSharedInternals.actQueue = null;
          0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
        }
        function flushActQueue(queue) {
          if (!isFlushing) {
            isFlushing = true;
            var i = 0;
            try {
              for (; i < queue.length; i++) {
                var callback = queue[i];
                do {
                  ReactSharedInternals.didUsePromise = false;
                  var continuation = callback(false);
                  if (null !== continuation) {
                    if (ReactSharedInternals.didUsePromise) {
                      queue[i] = callback;
                      queue.splice(0, i);
                      return;
                    }
                    callback = continuation;
                  } else break;
                } while (1);
              }
              queue.length = 0;
            } catch (error) {
              queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
            } finally {
              isFlushing = false;
            }
          }
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
          isMounted: function() {
            return false;
          },
          enqueueForceUpdate: function(publicInstance) {
            warnNoop(publicInstance, "forceUpdate");
          },
          enqueueReplaceState: function(publicInstance) {
            warnNoop(publicInstance, "replaceState");
          },
          enqueueSetState: function(publicInstance) {
            warnNoop(publicInstance, "setState");
          }
        }, assign = Object.assign, emptyObject = {};
        Object.freeze(emptyObject);
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
            throw Error(
              "takes an object of state variables to update or a function which returns an object of state variables."
            );
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        var deprecatedAPIs = {
          isMounted: [
            "isMounted",
            "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
          ],
          replaceState: [
            "replaceState",
            "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
          ]
        };
        for (fnName in deprecatedAPIs)
          deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
        ComponentDummy.prototype = Component.prototype;
        deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
        deprecatedAPIs.constructor = PureComponent;
        assign(deprecatedAPIs, Component.prototype);
        deprecatedAPIs.isPureReactComponent = true;
        var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = {
          H: null,
          A: null,
          T: null,
          S: null,
          actQueue: null,
          asyncTransitions: 0,
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false,
          didUsePromise: false,
          thrownErrors: [],
          getCurrentStack: null,
          recentlyCreatedOwnerStacks: 0
        }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
          return null;
        };
        deprecatedAPIs = {
          react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
          }
        };
        var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
        var didWarnAboutElementRef = {};
        var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
          deprecatedAPIs,
          UnknownOwner
        )();
        var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
        var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
          if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
            var event = new window.ErrorEvent("error", {
              bubbles: true,
              cancelable: true,
              message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
              error
            });
            if (!window.dispatchEvent(event)) return;
          } else if ("object" === typeof process && "function" === typeof process.emit) {
            process.emit("uncaughtException", error);
            return;
          }
          console.error(error);
        }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
          queueMicrotask(function() {
            return queueMicrotask(callback);
          });
        } : enqueueTask;
        deprecatedAPIs = Object.freeze({
          __proto__: null,
          c: function(size) {
            return resolveDispatcher().useMemoCache(size);
          }
        });
        var fnName = {
          map: mapChildren,
          forEach: function(children, forEachFunc, forEachContext) {
            mapChildren(
              children,
              function() {
                forEachFunc.apply(this, arguments);
              },
              forEachContext
            );
          },
          count: function(children) {
            var n = 0;
            mapChildren(children, function() {
              n++;
            });
            return n;
          },
          toArray: function(children) {
            return mapChildren(children, function(child) {
              return child;
            }) || [];
          },
          only: function(children) {
            if (!isValidElement2(children))
              throw Error(
                "React.Children.only expected to receive a single React element child."
              );
            return children;
          }
        };
        exports.Activity = REACT_ACTIVITY_TYPE;
        exports.Children = fnName;
        exports.Component = Component;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.PureComponent = PureComponent;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
        exports.__COMPILER_RUNTIME = deprecatedAPIs;
        exports.act = function(callback) {
          var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
          actScopeDepth++;
          var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
          try {
            var result = callback();
          } catch (error) {
            ReactSharedInternals.thrownErrors.push(error);
          }
          if (0 < ReactSharedInternals.thrownErrors.length)
            throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
          if (null !== result && "object" === typeof result && "function" === typeof result.then) {
            var thenable = result;
            queueSeveralMicrotasks(function() {
              didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
                "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
              ));
            });
            return {
              then: function(resolve, reject) {
                didAwaitActCall = true;
                thenable.then(
                  function(returnValue) {
                    popActScope(prevActQueue, prevActScopeDepth);
                    if (0 === prevActScopeDepth) {
                      try {
                        flushActQueue(queue), enqueueTask(function() {
                          return recursivelyFlushAsyncActWork(
                            returnValue,
                            resolve,
                            reject
                          );
                        });
                      } catch (error$0) {
                        ReactSharedInternals.thrownErrors.push(error$0);
                      }
                      if (0 < ReactSharedInternals.thrownErrors.length) {
                        var _thrownError = aggregateErrors(
                          ReactSharedInternals.thrownErrors
                        );
                        ReactSharedInternals.thrownErrors.length = 0;
                        reject(_thrownError);
                      }
                    } else resolve(returnValue);
                  },
                  function(error) {
                    popActScope(prevActQueue, prevActScopeDepth);
                    0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                      ReactSharedInternals.thrownErrors
                    ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                  }
                );
              }
            };
          }
          var returnValue$jscomp$0 = result;
          popActScope(prevActQueue, prevActScopeDepth);
          0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
            ));
          }), ReactSharedInternals.actQueue = null);
          if (0 < ReactSharedInternals.thrownErrors.length)
            throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
                return recursivelyFlushAsyncActWork(
                  returnValue$jscomp$0,
                  resolve,
                  reject
                );
              })) : resolve(returnValue$jscomp$0);
            }
          };
        };
        exports.cache = function(fn) {
          return function() {
            return fn.apply(null, arguments);
          };
        };
        exports.cacheSignal = function() {
          return null;
        };
        exports.captureOwnerStack = function() {
          var getCurrentStack = ReactSharedInternals.getCurrentStack;
          return null === getCurrentStack ? null : getCurrentStack();
        };
        exports.cloneElement = function(element, config, children) {
          if (null === element || void 0 === element)
            throw Error(
              "The argument must be a React element, but you passed " + element + "."
            );
          var props = assign({}, element.props), key = element.key, owner = element._owner;
          if (null != config) {
            var JSCompiler_inline_result;
            a: {
              if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
                config,
                "ref"
              ).get) && JSCompiler_inline_result.isReactWarning) {
                JSCompiler_inline_result = false;
                break a;
              }
              JSCompiler_inline_result = void 0 !== config.ref;
            }
            JSCompiler_inline_result && (owner = getOwner());
            hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
            for (propName in config)
              !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
          }
          var propName = arguments.length - 2;
          if (1 === propName) props.children = children;
          else if (1 < propName) {
            JSCompiler_inline_result = Array(propName);
            for (var i = 0; i < propName; i++)
              JSCompiler_inline_result[i] = arguments[i + 2];
            props.children = JSCompiler_inline_result;
          }
          props = ReactElement(
            element.type,
            key,
            props,
            owner,
            element._debugStack,
            element._debugTask
          );
          for (key = 2; key < arguments.length; key++)
            validateChildKeys(arguments[key]);
          return props;
        };
        exports.createContext = function(defaultValue) {
          defaultValue = {
            $$typeof: REACT_CONTEXT_TYPE,
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            _threadCount: 0,
            Provider: null,
            Consumer: null
          };
          defaultValue.Provider = defaultValue;
          defaultValue.Consumer = {
            $$typeof: REACT_CONSUMER_TYPE,
            _context: defaultValue
          };
          defaultValue._currentRenderer = null;
          defaultValue._currentRenderer2 = null;
          return defaultValue;
        };
        exports.createElement = function(type, config, children) {
          for (var i = 2; i < arguments.length; i++)
            validateChildKeys(arguments[i]);
          i = {};
          var key = null;
          if (null != config)
            for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
              "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
            )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
              hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
          var childrenLength = arguments.length - 2;
          if (1 === childrenLength) i.children = children;
          else if (1 < childrenLength) {
            for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
              childArray[_i] = arguments[_i + 2];
            Object.freeze && Object.freeze(childArray);
            i.children = childArray;
          }
          if (type && type.defaultProps)
            for (propName in childrenLength = type.defaultProps, childrenLength)
              void 0 === i[propName] && (i[propName] = childrenLength[propName]);
          key && defineKeyPropWarningGetter(
            i,
            "function" === typeof type ? type.displayName || type.name || "Unknown" : type
          );
          var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
          return ReactElement(
            type,
            key,
            i,
            getOwner(),
            propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
            propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
          );
        };
        exports.createRef = function() {
          var refObject = { current: null };
          Object.seal(refObject);
          return refObject;
        };
        exports.forwardRef = function(render) {
          null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
            "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
          ) : "function" !== typeof render ? console.error(
            "forwardRef requires a render function but was given %s.",
            null === render ? "null" : typeof render
          ) : 0 !== render.length && 2 !== render.length && console.error(
            "forwardRef render functions accept exactly two parameters: props and ref. %s",
            1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
          );
          null != render && null != render.defaultProps && console.error(
            "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
          );
          var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
          Object.defineProperty(elementType, "displayName", {
            enumerable: false,
            configurable: true,
            get: function() {
              return ownName;
            },
            set: function(name) {
              ownName = name;
              render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
            }
          });
          return elementType;
        };
        exports.isValidElement = isValidElement2;
        exports.lazy = function(ctor) {
          ctor = { _status: -1, _result: ctor };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: ctor,
            _init: lazyInitializer
          }, ioInfo = {
            name: "lazy",
            start: -1,
            end: -1,
            value: null,
            owner: null,
            debugStack: Error("react-stack-top-frame"),
            debugTask: console.createTask ? console.createTask("lazy()") : null
          };
          ctor._ioInfo = ioInfo;
          lazyType._debugInfo = [{ awaited: ioInfo }];
          return lazyType;
        };
        exports.memo = function(type, compare) {
          null == type && console.error(
            "memo: The first argument must be a component. Instead received: %s",
            null === type ? "null" : typeof type
          );
          compare = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: void 0 === compare ? null : compare
          };
          var ownName;
          Object.defineProperty(compare, "displayName", {
            enumerable: false,
            configurable: true,
            get: function() {
              return ownName;
            },
            set: function(name) {
              ownName = name;
              type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
            }
          });
          return compare;
        };
        exports.startTransition = function(scope) {
          var prevTransition = ReactSharedInternals.T, currentTransition = {};
          currentTransition._updatedFibers = /* @__PURE__ */ new Set();
          ReactSharedInternals.T = currentTransition;
          try {
            var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
            null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
            "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop2, reportGlobalError));
          } catch (error) {
            reportGlobalError(error);
          } finally {
            null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
              "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
            )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
              "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
            ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
          }
        };
        exports.unstable_useCacheRefresh = function() {
          return resolveDispatcher().useCacheRefresh();
        };
        exports.use = function(usable) {
          return resolveDispatcher().use(usable);
        };
        exports.useActionState = function(action, initialState, permalink) {
          return resolveDispatcher().useActionState(
            action,
            initialState,
            permalink
          );
        };
        exports.useCallback = function(callback, deps) {
          return resolveDispatcher().useCallback(callback, deps);
        };
        exports.useContext = function(Context) {
          var dispatcher = resolveDispatcher();
          Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
            "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
          );
          return dispatcher.useContext(Context);
        };
        exports.useDebugValue = function(value, formatterFn) {
          return resolveDispatcher().useDebugValue(value, formatterFn);
        };
        exports.useDeferredValue = function(value, initialValue) {
          return resolveDispatcher().useDeferredValue(value, initialValue);
        };
        exports.useEffect = function(create, deps) {
          null == create && console.warn(
            "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
          );
          return resolveDispatcher().useEffect(create, deps);
        };
        exports.useEffectEvent = function(callback) {
          return resolveDispatcher().useEffectEvent(callback);
        };
        exports.useId = function() {
          return resolveDispatcher().useId();
        };
        exports.useImperativeHandle = function(ref, create, deps) {
          return resolveDispatcher().useImperativeHandle(ref, create, deps);
        };
        exports.useInsertionEffect = function(create, deps) {
          null == create && console.warn(
            "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
          );
          return resolveDispatcher().useInsertionEffect(create, deps);
        };
        exports.useLayoutEffect = function(create, deps) {
          null == create && console.warn(
            "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
          );
          return resolveDispatcher().useLayoutEffect(create, deps);
        };
        exports.useMemo = function(create, deps) {
          return resolveDispatcher().useMemo(create, deps);
        };
        exports.useOptimistic = function(passthrough, reducer) {
          return resolveDispatcher().useOptimistic(passthrough, reducer);
        };
        exports.useReducer = function(reducer, initialArg, init2) {
          return resolveDispatcher().useReducer(reducer, initialArg, init2);
        };
        exports.useRef = function(initialValue) {
          return resolveDispatcher().useRef(initialValue);
        };
        exports.useState = function(initialState) {
          return resolveDispatcher().useState(initialState);
        };
        exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
          return resolveDispatcher().useSyncExternalStore(
            subscribe,
            getSnapshot,
            getServerSnapshot
          );
        };
        exports.useTransition = function() {
          return resolveDispatcher().useTransition();
        };
        exports.version = "19.2.0";
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // node_modules/react/index.js
  var require_react = __commonJS({
    "node_modules/react/index.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_react_development();
      }
    }
  });

  // node_modules/void-elements/index.js
  var require_void_elements = __commonJS({
    "node_modules/void-elements/index.js"(exports, module) {
      module.exports = {
        "area": true,
        "base": true,
        "br": true,
        "col": true,
        "embed": true,
        "hr": true,
        "img": true,
        "input": true,
        "link": true,
        "meta": true,
        "param": true,
        "source": true,
        "track": true,
        "wbr": true
      };
    }
  });

  // node_modules/i18next/dist/esm/i18next.js
  var isString = (obj) => typeof obj === "string";
  var defer = () => {
    let res;
    let rej;
    const promise = new Promise((resolve, reject) => {
      res = resolve;
      rej = reject;
    });
    promise.resolve = res;
    promise.reject = rej;
    return promise;
  };
  var makeString = (object) => {
    if (object == null) return "";
    return "" + object;
  };
  var copy = (a, s, t2) => {
    a.forEach((m) => {
      if (s[m]) t2[m] = s[m];
    });
  };
  var lastOfPathSeparatorRegExp = /###/g;
  var cleanKey = (key) => key && key.indexOf("###") > -1 ? key.replace(lastOfPathSeparatorRegExp, ".") : key;
  var canNotTraverseDeeper = (object) => !object || isString(object);
  var getLastOfPath = (object, path2, Empty) => {
    const stack = !isString(path2) ? path2 : path2.split(".");
    let stackIndex = 0;
    while (stackIndex < stack.length - 1) {
      if (canNotTraverseDeeper(object)) return {};
      const key = cleanKey(stack[stackIndex]);
      if (!object[key] && Empty) object[key] = new Empty();
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        object = object[key];
      } else {
        object = {};
      }
      ++stackIndex;
    }
    if (canNotTraverseDeeper(object)) return {};
    return {
      obj: object,
      k: cleanKey(stack[stackIndex])
    };
  };
  var setPath = (object, path2, newValue) => {
    const {
      obj,
      k
    } = getLastOfPath(object, path2, Object);
    if (obj !== void 0 || path2.length === 1) {
      obj[k] = newValue;
      return;
    }
    let e2 = path2[path2.length - 1];
    let p = path2.slice(0, path2.length - 1);
    let last = getLastOfPath(object, p, Object);
    while (last.obj === void 0 && p.length) {
      e2 = `${p[p.length - 1]}.${e2}`;
      p = p.slice(0, p.length - 1);
      last = getLastOfPath(object, p, Object);
      if (last?.obj && typeof last.obj[`${last.k}.${e2}`] !== "undefined") {
        last.obj = void 0;
      }
    }
    last.obj[`${last.k}.${e2}`] = newValue;
  };
  var pushPath = (object, path2, newValue, concat) => {
    const {
      obj,
      k
    } = getLastOfPath(object, path2, Object);
    obj[k] = obj[k] || [];
    obj[k].push(newValue);
  };
  var getPath = (object, path2) => {
    const {
      obj,
      k
    } = getLastOfPath(object, path2);
    if (!obj) return void 0;
    if (!Object.prototype.hasOwnProperty.call(obj, k)) return void 0;
    return obj[k];
  };
  var getPathWithDefaults = (data, defaultData, key) => {
    const value = getPath(data, key);
    if (value !== void 0) {
      return value;
    }
    return getPath(defaultData, key);
  };
  var deepExtend = (target, source, overwrite) => {
    for (const prop in source) {
      if (prop !== "__proto__" && prop !== "constructor") {
        if (prop in target) {
          if (isString(target[prop]) || target[prop] instanceof String || isString(source[prop]) || source[prop] instanceof String) {
            if (overwrite) target[prop] = source[prop];
          } else {
            deepExtend(target[prop], source[prop], overwrite);
          }
        } else {
          target[prop] = source[prop];
        }
      }
    }
    return target;
  };
  var regexEscape = (str) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  var _entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
  };
  var escape = (data) => {
    if (isString(data)) {
      return data.replace(/[&<>"'\/]/g, (s) => _entityMap[s]);
    }
    return data;
  };
  var RegExpCache = class {
    constructor(capacity) {
      this.capacity = capacity;
      this.regExpMap = /* @__PURE__ */ new Map();
      this.regExpQueue = [];
    }
    getRegExp(pattern) {
      const regExpFromCache = this.regExpMap.get(pattern);
      if (regExpFromCache !== void 0) {
        return regExpFromCache;
      }
      const regExpNew = new RegExp(pattern);
      if (this.regExpQueue.length === this.capacity) {
        this.regExpMap.delete(this.regExpQueue.shift());
      }
      this.regExpMap.set(pattern, regExpNew);
      this.regExpQueue.push(pattern);
      return regExpNew;
    }
  };
  var chars = [" ", ",", "?", "!", ";"];
  var looksLikeObjectPathRegExpCache = new RegExpCache(20);
  var looksLikeObjectPath = (key, nsSeparator, keySeparator) => {
    nsSeparator = nsSeparator || "";
    keySeparator = keySeparator || "";
    const possibleChars = chars.filter((c) => nsSeparator.indexOf(c) < 0 && keySeparator.indexOf(c) < 0);
    if (possibleChars.length === 0) return true;
    const r = looksLikeObjectPathRegExpCache.getRegExp(`(${possibleChars.map((c) => c === "?" ? "\\?" : c).join("|")})`);
    let matched = !r.test(key);
    if (!matched) {
      const ki = key.indexOf(keySeparator);
      if (ki > 0 && !r.test(key.substring(0, ki))) {
        matched = true;
      }
    }
    return matched;
  };
  var deepFind = (obj, path2, keySeparator = ".") => {
    if (!obj) return void 0;
    if (obj[path2]) {
      if (!Object.prototype.hasOwnProperty.call(obj, path2)) return void 0;
      return obj[path2];
    }
    const tokens = path2.split(keySeparator);
    let current = obj;
    for (let i = 0; i < tokens.length; ) {
      if (!current || typeof current !== "object") {
        return void 0;
      }
      let next;
      let nextPath = "";
      for (let j = i; j < tokens.length; ++j) {
        if (j !== i) {
          nextPath += keySeparator;
        }
        nextPath += tokens[j];
        next = current[nextPath];
        if (next !== void 0) {
          if (["string", "number", "boolean"].indexOf(typeof next) > -1 && j < tokens.length - 1) {
            continue;
          }
          i += j - i + 1;
          break;
        }
      }
      current = next;
    }
    return current;
  };
  var getCleanedCode = (code) => code?.replace("_", "-");
  var consoleLogger = {
    type: "logger",
    log(args) {
      this.output("log", args);
    },
    warn(args) {
      this.output("warn", args);
    },
    error(args) {
      this.output("error", args);
    },
    output(type, args) {
      console?.[type]?.apply?.(console, args);
    }
  };
  var Logger = class _Logger {
    constructor(concreteLogger, options = {}) {
      this.init(concreteLogger, options);
    }
    init(concreteLogger, options = {}) {
      this.prefix = options.prefix || "i18next:";
      this.logger = concreteLogger || consoleLogger;
      this.options = options;
      this.debug = options.debug;
    }
    log(...args) {
      return this.forward(args, "log", "", true);
    }
    warn(...args) {
      return this.forward(args, "warn", "", true);
    }
    error(...args) {
      return this.forward(args, "error", "");
    }
    deprecate(...args) {
      return this.forward(args, "warn", "WARNING DEPRECATED: ", true);
    }
    forward(args, lvl, prefix, debugOnly) {
      if (debugOnly && !this.debug) return null;
      if (isString(args[0])) args[0] = `${prefix}${this.prefix} ${args[0]}`;
      return this.logger[lvl](args);
    }
    create(moduleName) {
      return new _Logger(this.logger, {
        ...{
          prefix: `${this.prefix}:${moduleName}:`
        },
        ...this.options
      });
    }
    clone(options) {
      options = options || this.options;
      options.prefix = options.prefix || this.prefix;
      return new _Logger(this.logger, options);
    }
  };
  var baseLogger = new Logger();
  var EventEmitter = class {
    constructor() {
      this.observers = {};
    }
    on(events, listener) {
      events.split(" ").forEach((event) => {
        if (!this.observers[event]) this.observers[event] = /* @__PURE__ */ new Map();
        const numListeners = this.observers[event].get(listener) || 0;
        this.observers[event].set(listener, numListeners + 1);
      });
      return this;
    }
    off(event, listener) {
      if (!this.observers[event]) return;
      if (!listener) {
        delete this.observers[event];
        return;
      }
      this.observers[event].delete(listener);
    }
    emit(event, ...args) {
      if (this.observers[event]) {
        const cloned = Array.from(this.observers[event].entries());
        cloned.forEach(([observer, numTimesAdded]) => {
          for (let i = 0; i < numTimesAdded; i++) {
            observer(...args);
          }
        });
      }
      if (this.observers["*"]) {
        const cloned = Array.from(this.observers["*"].entries());
        cloned.forEach(([observer, numTimesAdded]) => {
          for (let i = 0; i < numTimesAdded; i++) {
            observer.apply(observer, [event, ...args]);
          }
        });
      }
    }
  };
  var ResourceStore = class extends EventEmitter {
    constructor(data, options = {
      ns: ["translation"],
      defaultNS: "translation"
    }) {
      super();
      this.data = data || {};
      this.options = options;
      if (this.options.keySeparator === void 0) {
        this.options.keySeparator = ".";
      }
      if (this.options.ignoreJSONStructure === void 0) {
        this.options.ignoreJSONStructure = true;
      }
    }
    addNamespaces(ns) {
      if (this.options.ns.indexOf(ns) < 0) {
        this.options.ns.push(ns);
      }
    }
    removeNamespaces(ns) {
      const index = this.options.ns.indexOf(ns);
      if (index > -1) {
        this.options.ns.splice(index, 1);
      }
    }
    getResource(lng, ns, key, options = {}) {
      const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
      const ignoreJSONStructure = options.ignoreJSONStructure !== void 0 ? options.ignoreJSONStructure : this.options.ignoreJSONStructure;
      let path2;
      if (lng.indexOf(".") > -1) {
        path2 = lng.split(".");
      } else {
        path2 = [lng, ns];
        if (key) {
          if (Array.isArray(key)) {
            path2.push(...key);
          } else if (isString(key) && keySeparator) {
            path2.push(...key.split(keySeparator));
          } else {
            path2.push(key);
          }
        }
      }
      const result = getPath(this.data, path2);
      if (!result && !ns && !key && lng.indexOf(".") > -1) {
        lng = path2[0];
        ns = path2[1];
        key = path2.slice(2).join(".");
      }
      if (result || !ignoreJSONStructure || !isString(key)) return result;
      return deepFind(this.data?.[lng]?.[ns], key, keySeparator);
    }
    addResource(lng, ns, key, value, options = {
      silent: false
    }) {
      const keySeparator = options.keySeparator !== void 0 ? options.keySeparator : this.options.keySeparator;
      let path2 = [lng, ns];
      if (key) path2 = path2.concat(keySeparator ? key.split(keySeparator) : key);
      if (lng.indexOf(".") > -1) {
        path2 = lng.split(".");
        value = ns;
        ns = path2[1];
      }
      this.addNamespaces(ns);
      setPath(this.data, path2, value);
      if (!options.silent) this.emit("added", lng, ns, key, value);
    }
    addResources(lng, ns, resources2, options = {
      silent: false
    }) {
      for (const m in resources2) {
        if (isString(resources2[m]) || Array.isArray(resources2[m])) this.addResource(lng, ns, m, resources2[m], {
          silent: true
        });
      }
      if (!options.silent) this.emit("added", lng, ns, resources2);
    }
    addResourceBundle(lng, ns, resources2, deep, overwrite, options = {
      silent: false,
      skipCopy: false
    }) {
      let path2 = [lng, ns];
      if (lng.indexOf(".") > -1) {
        path2 = lng.split(".");
        deep = resources2;
        resources2 = ns;
        ns = path2[1];
      }
      this.addNamespaces(ns);
      let pack = getPath(this.data, path2) || {};
      if (!options.skipCopy) resources2 = JSON.parse(JSON.stringify(resources2));
      if (deep) {
        deepExtend(pack, resources2, overwrite);
      } else {
        pack = {
          ...pack,
          ...resources2
        };
      }
      setPath(this.data, path2, pack);
      if (!options.silent) this.emit("added", lng, ns, resources2);
    }
    removeResourceBundle(lng, ns) {
      if (this.hasResourceBundle(lng, ns)) {
        delete this.data[lng][ns];
      }
      this.removeNamespaces(ns);
      this.emit("removed", lng, ns);
    }
    hasResourceBundle(lng, ns) {
      return this.getResource(lng, ns) !== void 0;
    }
    getResourceBundle(lng, ns) {
      if (!ns) ns = this.options.defaultNS;
      return this.getResource(lng, ns);
    }
    getDataByLanguage(lng) {
      return this.data[lng];
    }
    hasLanguageSomeTranslations(lng) {
      const data = this.getDataByLanguage(lng);
      const n = data && Object.keys(data) || [];
      return !!n.find((v) => data[v] && Object.keys(data[v]).length > 0);
    }
    toJSON() {
      return this.data;
    }
  };
  var postProcessor = {
    processors: {},
    addPostProcessor(module) {
      this.processors[module.name] = module;
    },
    handle(processors, value, key, options, translator) {
      processors.forEach((processor) => {
        value = this.processors[processor]?.process(value, key, options, translator) ?? value;
      });
      return value;
    }
  };
  var PATH_KEY = Symbol("i18next/PATH_KEY");
  function createProxy() {
    const state = [];
    const handler = /* @__PURE__ */ Object.create(null);
    let proxy;
    handler.get = (target, key) => {
      proxy?.revoke?.();
      if (key === PATH_KEY) return state;
      state.push(key);
      proxy = Proxy.revocable(target, handler);
      return proxy.proxy;
    };
    return Proxy.revocable(/* @__PURE__ */ Object.create(null), handler).proxy;
  }
  function keysFromSelector(selector, opts) {
    const {
      [PATH_KEY]: path2
    } = selector(createProxy());
    return path2.join(opts?.keySeparator ?? ".");
  }
  var checkedLoadedFor = {};
  var shouldHandleAsObject = (res) => !isString(res) && typeof res !== "boolean" && typeof res !== "number";
  var Translator = class _Translator extends EventEmitter {
    constructor(services, options = {}) {
      super();
      copy(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils"], services, this);
      this.options = options;
      if (this.options.keySeparator === void 0) {
        this.options.keySeparator = ".";
      }
      this.logger = baseLogger.create("translator");
    }
    changeLanguage(lng) {
      if (lng) this.language = lng;
    }
    exists(key, o = {
      interpolation: {}
    }) {
      const opt = {
        ...o
      };
      if (key == null) return false;
      const resolved = this.resolve(key, opt);
      return resolved?.res !== void 0;
    }
    extractFromKey(key, opt) {
      let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
      if (nsSeparator === void 0) nsSeparator = ":";
      const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
      let namespaces = opt.ns || this.options.defaultNS || [];
      const wouldCheckForNsInKey = nsSeparator && key.indexOf(nsSeparator) > -1;
      const seemsNaturalLanguage = !this.options.userDefinedKeySeparator && !opt.keySeparator && !this.options.userDefinedNsSeparator && !opt.nsSeparator && !looksLikeObjectPath(key, nsSeparator, keySeparator);
      if (wouldCheckForNsInKey && !seemsNaturalLanguage) {
        const m = key.match(this.interpolator.nestingRegexp);
        if (m && m.length > 0) {
          return {
            key,
            namespaces: isString(namespaces) ? [namespaces] : namespaces
          };
        }
        const parts = key.split(nsSeparator);
        if (nsSeparator !== keySeparator || nsSeparator === keySeparator && this.options.ns.indexOf(parts[0]) > -1) namespaces = parts.shift();
        key = parts.join(keySeparator);
      }
      return {
        key,
        namespaces: isString(namespaces) ? [namespaces] : namespaces
      };
    }
    translate(keys, o, lastKey) {
      let opt = typeof o === "object" ? {
        ...o
      } : o;
      if (typeof opt !== "object" && this.options.overloadTranslationOptionHandler) {
        opt = this.options.overloadTranslationOptionHandler(arguments);
      }
      if (typeof opt === "object") opt = {
        ...opt
      };
      if (!opt) opt = {};
      if (keys == null) return "";
      if (typeof keys === "function") keys = keysFromSelector(keys, {
        ...this.options,
        ...opt
      });
      if (!Array.isArray(keys)) keys = [String(keys)];
      const returnDetails = opt.returnDetails !== void 0 ? opt.returnDetails : this.options.returnDetails;
      const keySeparator = opt.keySeparator !== void 0 ? opt.keySeparator : this.options.keySeparator;
      const {
        key,
        namespaces
      } = this.extractFromKey(keys[keys.length - 1], opt);
      const namespace = namespaces[namespaces.length - 1];
      let nsSeparator = opt.nsSeparator !== void 0 ? opt.nsSeparator : this.options.nsSeparator;
      if (nsSeparator === void 0) nsSeparator = ":";
      const lng = opt.lng || this.language;
      const appendNamespaceToCIMode = opt.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
      if (lng?.toLowerCase() === "cimode") {
        if (appendNamespaceToCIMode) {
          if (returnDetails) {
            return {
              res: `${namespace}${nsSeparator}${key}`,
              usedKey: key,
              exactUsedKey: key,
              usedLng: lng,
              usedNS: namespace,
              usedParams: this.getUsedParamsDetails(opt)
            };
          }
          return `${namespace}${nsSeparator}${key}`;
        }
        if (returnDetails) {
          return {
            res: key,
            usedKey: key,
            exactUsedKey: key,
            usedLng: lng,
            usedNS: namespace,
            usedParams: this.getUsedParamsDetails(opt)
          };
        }
        return key;
      }
      const resolved = this.resolve(keys, opt);
      let res = resolved?.res;
      const resUsedKey = resolved?.usedKey || key;
      const resExactUsedKey = resolved?.exactUsedKey || key;
      const noObject = ["[object Number]", "[object Function]", "[object RegExp]"];
      const joinArrays = opt.joinArrays !== void 0 ? opt.joinArrays : this.options.joinArrays;
      const handleAsObjectInI18nFormat = !this.i18nFormat || this.i18nFormat.handleAsObject;
      const needsPluralHandling = opt.count !== void 0 && !isString(opt.count);
      const hasDefaultValue = _Translator.hasDefaultValue(opt);
      const defaultValueSuffix = needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, opt) : "";
      const defaultValueSuffixOrdinalFallback = opt.ordinal && needsPluralHandling ? this.pluralResolver.getSuffix(lng, opt.count, {
        ordinal: false
      }) : "";
      const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
      const defaultValue = needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] || opt[`defaultValue${defaultValueSuffix}`] || opt[`defaultValue${defaultValueSuffixOrdinalFallback}`] || opt.defaultValue;
      let resForObjHndl = res;
      if (handleAsObjectInI18nFormat && !res && hasDefaultValue) {
        resForObjHndl = defaultValue;
      }
      const handleAsObject = shouldHandleAsObject(resForObjHndl);
      const resType = Object.prototype.toString.apply(resForObjHndl);
      if (handleAsObjectInI18nFormat && resForObjHndl && handleAsObject && noObject.indexOf(resType) < 0 && !(isString(joinArrays) && Array.isArray(resForObjHndl))) {
        if (!opt.returnObjects && !this.options.returnObjects) {
          if (!this.options.returnedObjectHandler) {
            this.logger.warn("accessing an object - but returnObjects options is not enabled!");
          }
          const r = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(resUsedKey, resForObjHndl, {
            ...opt,
            ns: namespaces
          }) : `key '${key} (${this.language})' returned an object instead of string.`;
          if (returnDetails) {
            resolved.res = r;
            resolved.usedParams = this.getUsedParamsDetails(opt);
            return resolved;
          }
          return r;
        }
        if (keySeparator) {
          const resTypeIsArray = Array.isArray(resForObjHndl);
          const copy2 = resTypeIsArray ? [] : {};
          const newKeyToUse = resTypeIsArray ? resExactUsedKey : resUsedKey;
          for (const m in resForObjHndl) {
            if (Object.prototype.hasOwnProperty.call(resForObjHndl, m)) {
              const deepKey = `${newKeyToUse}${keySeparator}${m}`;
              if (hasDefaultValue && !res) {
                copy2[m] = this.translate(deepKey, {
                  ...opt,
                  defaultValue: shouldHandleAsObject(defaultValue) ? defaultValue[m] : void 0,
                  ...{
                    joinArrays: false,
                    ns: namespaces
                  }
                });
              } else {
                copy2[m] = this.translate(deepKey, {
                  ...opt,
                  ...{
                    joinArrays: false,
                    ns: namespaces
                  }
                });
              }
              if (copy2[m] === deepKey) copy2[m] = resForObjHndl[m];
            }
          }
          res = copy2;
        }
      } else if (handleAsObjectInI18nFormat && isString(joinArrays) && Array.isArray(res)) {
        res = res.join(joinArrays);
        if (res) res = this.extendTranslation(res, keys, opt, lastKey);
      } else {
        let usedDefault = false;
        let usedKey = false;
        if (!this.isValidLookup(res) && hasDefaultValue) {
          usedDefault = true;
          res = defaultValue;
        }
        if (!this.isValidLookup(res)) {
          usedKey = true;
          res = key;
        }
        const missingKeyNoValueFallbackToKey = opt.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey;
        const resForMissing = missingKeyNoValueFallbackToKey && usedKey ? void 0 : res;
        const updateMissing = hasDefaultValue && defaultValue !== res && this.options.updateMissing;
        if (usedKey || usedDefault || updateMissing) {
          this.logger.log(updateMissing ? "updateKey" : "missingKey", lng, namespace, key, updateMissing ? defaultValue : res);
          if (keySeparator) {
            const fk = this.resolve(key, {
              ...opt,
              keySeparator: false
            });
            if (fk && fk.res) this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.");
          }
          let lngs = [];
          const fallbackLngs = this.languageUtils.getFallbackCodes(this.options.fallbackLng, opt.lng || this.language);
          if (this.options.saveMissingTo === "fallback" && fallbackLngs && fallbackLngs[0]) {
            for (let i = 0; i < fallbackLngs.length; i++) {
              lngs.push(fallbackLngs[i]);
            }
          } else if (this.options.saveMissingTo === "all") {
            lngs = this.languageUtils.toResolveHierarchy(opt.lng || this.language);
          } else {
            lngs.push(opt.lng || this.language);
          }
          const send = (l, k, specificDefaultValue) => {
            const defaultForMissing = hasDefaultValue && specificDefaultValue !== res ? specificDefaultValue : resForMissing;
            if (this.options.missingKeyHandler) {
              this.options.missingKeyHandler(l, namespace, k, defaultForMissing, updateMissing, opt);
            } else if (this.backendConnector?.saveMissing) {
              this.backendConnector.saveMissing(l, namespace, k, defaultForMissing, updateMissing, opt);
            }
            this.emit("missingKey", l, namespace, k, res);
          };
          if (this.options.saveMissing) {
            if (this.options.saveMissingPlurals && needsPluralHandling) {
              lngs.forEach((language) => {
                const suffixes = this.pluralResolver.getSuffixes(language, opt);
                if (needsZeroSuffixLookup && opt[`defaultValue${this.options.pluralSeparator}zero`] && suffixes.indexOf(`${this.options.pluralSeparator}zero`) < 0) {
                  suffixes.push(`${this.options.pluralSeparator}zero`);
                }
                suffixes.forEach((suffix) => {
                  send([language], key + suffix, opt[`defaultValue${suffix}`] || defaultValue);
                });
              });
            } else {
              send(lngs, key, defaultValue);
            }
          }
        }
        res = this.extendTranslation(res, keys, opt, resolved, lastKey);
        if (usedKey && res === key && this.options.appendNamespaceToMissingKey) {
          res = `${namespace}${nsSeparator}${key}`;
        }
        if ((usedKey || usedDefault) && this.options.parseMissingKeyHandler) {
          res = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${namespace}${nsSeparator}${key}` : key, usedDefault ? res : void 0, opt);
        }
      }
      if (returnDetails) {
        resolved.res = res;
        resolved.usedParams = this.getUsedParamsDetails(opt);
        return resolved;
      }
      return res;
    }
    extendTranslation(res, key, opt, resolved, lastKey) {
      if (this.i18nFormat?.parse) {
        res = this.i18nFormat.parse(res, {
          ...this.options.interpolation.defaultVariables,
          ...opt
        }, opt.lng || this.language || resolved.usedLng, resolved.usedNS, resolved.usedKey, {
          resolved
        });
      } else if (!opt.skipInterpolation) {
        if (opt.interpolation) this.interpolator.init({
          ...opt,
          ...{
            interpolation: {
              ...this.options.interpolation,
              ...opt.interpolation
            }
          }
        });
        const skipOnVariables = isString(res) && (opt?.interpolation?.skipOnVariables !== void 0 ? opt.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
        let nestBef;
        if (skipOnVariables) {
          const nb = res.match(this.interpolator.nestingRegexp);
          nestBef = nb && nb.length;
        }
        let data = opt.replace && !isString(opt.replace) ? opt.replace : opt;
        if (this.options.interpolation.defaultVariables) data = {
          ...this.options.interpolation.defaultVariables,
          ...data
        };
        res = this.interpolator.interpolate(res, data, opt.lng || this.language || resolved.usedLng, opt);
        if (skipOnVariables) {
          const na = res.match(this.interpolator.nestingRegexp);
          const nestAft = na && na.length;
          if (nestBef < nestAft) opt.nest = false;
        }
        if (!opt.lng && resolved && resolved.res) opt.lng = this.language || resolved.usedLng;
        if (opt.nest !== false) res = this.interpolator.nest(res, (...args) => {
          if (lastKey?.[0] === args[0] && !opt.context) {
            this.logger.warn(`It seems you are nesting recursively key: ${args[0]} in key: ${key[0]}`);
            return null;
          }
          return this.translate(...args, key);
        }, opt);
        if (opt.interpolation) this.interpolator.reset();
      }
      const postProcess = opt.postProcess || this.options.postProcess;
      const postProcessorNames = isString(postProcess) ? [postProcess] : postProcess;
      if (res != null && postProcessorNames?.length && opt.applyPostProcessor !== false) {
        res = postProcessor.handle(postProcessorNames, res, key, this.options && this.options.postProcessPassResolved ? {
          i18nResolved: {
            ...resolved,
            usedParams: this.getUsedParamsDetails(opt)
          },
          ...opt
        } : opt, this);
      }
      return res;
    }
    resolve(keys, opt = {}) {
      let found;
      let usedKey;
      let exactUsedKey;
      let usedLng;
      let usedNS;
      if (isString(keys)) keys = [keys];
      keys.forEach((k) => {
        if (this.isValidLookup(found)) return;
        const extracted = this.extractFromKey(k, opt);
        const key = extracted.key;
        usedKey = key;
        let namespaces = extracted.namespaces;
        if (this.options.fallbackNS) namespaces = namespaces.concat(this.options.fallbackNS);
        const needsPluralHandling = opt.count !== void 0 && !isString(opt.count);
        const needsZeroSuffixLookup = needsPluralHandling && !opt.ordinal && opt.count === 0;
        const needsContextHandling = opt.context !== void 0 && (isString(opt.context) || typeof opt.context === "number") && opt.context !== "";
        const codes = opt.lngs ? opt.lngs : this.languageUtils.toResolveHierarchy(opt.lng || this.language, opt.fallbackLng);
        namespaces.forEach((ns) => {
          if (this.isValidLookup(found)) return;
          usedNS = ns;
          if (!checkedLoadedFor[`${codes[0]}-${ns}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(usedNS)) {
            checkedLoadedFor[`${codes[0]}-${ns}`] = true;
            this.logger.warn(`key "${usedKey}" for languages "${codes.join(", ")}" won't get resolved as namespace "${usedNS}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
          }
          codes.forEach((code) => {
            if (this.isValidLookup(found)) return;
            usedLng = code;
            const finalKeys = [key];
            if (this.i18nFormat?.addLookupKeys) {
              this.i18nFormat.addLookupKeys(finalKeys, key, code, ns, opt);
            } else {
              let pluralSuffix;
              if (needsPluralHandling) pluralSuffix = this.pluralResolver.getSuffix(code, opt.count, opt);
              const zeroSuffix = `${this.options.pluralSeparator}zero`;
              const ordinalPrefix = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
              if (needsPluralHandling) {
                if (opt.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                  finalKeys.push(key + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
                }
                finalKeys.push(key + pluralSuffix);
                if (needsZeroSuffixLookup) {
                  finalKeys.push(key + zeroSuffix);
                }
              }
              if (needsContextHandling) {
                const contextKey = `${key}${this.options.contextSeparator || "_"}${opt.context}`;
                finalKeys.push(contextKey);
                if (needsPluralHandling) {
                  if (opt.ordinal && pluralSuffix.indexOf(ordinalPrefix) === 0) {
                    finalKeys.push(contextKey + pluralSuffix.replace(ordinalPrefix, this.options.pluralSeparator));
                  }
                  finalKeys.push(contextKey + pluralSuffix);
                  if (needsZeroSuffixLookup) {
                    finalKeys.push(contextKey + zeroSuffix);
                  }
                }
              }
            }
            let possibleKey;
            while (possibleKey = finalKeys.pop()) {
              if (!this.isValidLookup(found)) {
                exactUsedKey = possibleKey;
                found = this.getResource(code, ns, possibleKey, opt);
              }
            }
          });
        });
      });
      return {
        res: found,
        usedKey,
        exactUsedKey,
        usedLng,
        usedNS
      };
    }
    isValidLookup(res) {
      return res !== void 0 && !(!this.options.returnNull && res === null) && !(!this.options.returnEmptyString && res === "");
    }
    getResource(code, ns, key, options = {}) {
      if (this.i18nFormat?.getResource) return this.i18nFormat.getResource(code, ns, key, options);
      return this.resourceStore.getResource(code, ns, key, options);
    }
    getUsedParamsDetails(options = {}) {
      const optionsKeys = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"];
      const useOptionsReplaceForData = options.replace && !isString(options.replace);
      let data = useOptionsReplaceForData ? options.replace : options;
      if (useOptionsReplaceForData && typeof options.count !== "undefined") {
        data.count = options.count;
      }
      if (this.options.interpolation.defaultVariables) {
        data = {
          ...this.options.interpolation.defaultVariables,
          ...data
        };
      }
      if (!useOptionsReplaceForData) {
        data = {
          ...data
        };
        for (const key of optionsKeys) {
          delete data[key];
        }
      }
      return data;
    }
    static hasDefaultValue(options) {
      const prefix = "defaultValue";
      for (const option in options) {
        if (Object.prototype.hasOwnProperty.call(options, option) && prefix === option.substring(0, prefix.length) && void 0 !== options[option]) {
          return true;
        }
      }
      return false;
    }
  };
  var LanguageUtil = class {
    constructor(options) {
      this.options = options;
      this.supportedLngs = this.options.supportedLngs || false;
      this.logger = baseLogger.create("languageUtils");
    }
    getScriptPartFromCode(code) {
      code = getCleanedCode(code);
      if (!code || code.indexOf("-") < 0) return null;
      const p = code.split("-");
      if (p.length === 2) return null;
      p.pop();
      if (p[p.length - 1].toLowerCase() === "x") return null;
      return this.formatLanguageCode(p.join("-"));
    }
    getLanguagePartFromCode(code) {
      code = getCleanedCode(code);
      if (!code || code.indexOf("-") < 0) return code;
      const p = code.split("-");
      return this.formatLanguageCode(p[0]);
    }
    formatLanguageCode(code) {
      if (isString(code) && code.indexOf("-") > -1) {
        let formattedCode;
        try {
          formattedCode = Intl.getCanonicalLocales(code)[0];
        } catch (e2) {
        }
        if (formattedCode && this.options.lowerCaseLng) {
          formattedCode = formattedCode.toLowerCase();
        }
        if (formattedCode) return formattedCode;
        if (this.options.lowerCaseLng) {
          return code.toLowerCase();
        }
        return code;
      }
      return this.options.cleanCode || this.options.lowerCaseLng ? code.toLowerCase() : code;
    }
    isSupportedCode(code) {
      if (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) {
        code = this.getLanguagePartFromCode(code);
      }
      return !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(code) > -1;
    }
    getBestMatchFromCodes(codes) {
      if (!codes) return null;
      let found;
      codes.forEach((code) => {
        if (found) return;
        const cleanedLng = this.formatLanguageCode(code);
        if (!this.options.supportedLngs || this.isSupportedCode(cleanedLng)) found = cleanedLng;
      });
      if (!found && this.options.supportedLngs) {
        codes.forEach((code) => {
          if (found) return;
          const lngScOnly = this.getScriptPartFromCode(code);
          if (this.isSupportedCode(lngScOnly)) return found = lngScOnly;
          const lngOnly = this.getLanguagePartFromCode(code);
          if (this.isSupportedCode(lngOnly)) return found = lngOnly;
          found = this.options.supportedLngs.find((supportedLng) => {
            if (supportedLng === lngOnly) return supportedLng;
            if (supportedLng.indexOf("-") < 0 && lngOnly.indexOf("-") < 0) return;
            if (supportedLng.indexOf("-") > 0 && lngOnly.indexOf("-") < 0 && supportedLng.substring(0, supportedLng.indexOf("-")) === lngOnly) return supportedLng;
            if (supportedLng.indexOf(lngOnly) === 0 && lngOnly.length > 1) return supportedLng;
          });
        });
      }
      if (!found) found = this.getFallbackCodes(this.options.fallbackLng)[0];
      return found;
    }
    getFallbackCodes(fallbacks, code) {
      if (!fallbacks) return [];
      if (typeof fallbacks === "function") fallbacks = fallbacks(code);
      if (isString(fallbacks)) fallbacks = [fallbacks];
      if (Array.isArray(fallbacks)) return fallbacks;
      if (!code) return fallbacks.default || [];
      let found = fallbacks[code];
      if (!found) found = fallbacks[this.getScriptPartFromCode(code)];
      if (!found) found = fallbacks[this.formatLanguageCode(code)];
      if (!found) found = fallbacks[this.getLanguagePartFromCode(code)];
      if (!found) found = fallbacks.default;
      return found || [];
    }
    toResolveHierarchy(code, fallbackCode) {
      const fallbackCodes = this.getFallbackCodes((fallbackCode === false ? [] : fallbackCode) || this.options.fallbackLng || [], code);
      const codes = [];
      const addCode = (c) => {
        if (!c) return;
        if (this.isSupportedCode(c)) {
          codes.push(c);
        } else {
          this.logger.warn(`rejecting language code not found in supportedLngs: ${c}`);
        }
      };
      if (isString(code) && (code.indexOf("-") > -1 || code.indexOf("_") > -1)) {
        if (this.options.load !== "languageOnly") addCode(this.formatLanguageCode(code));
        if (this.options.load !== "languageOnly" && this.options.load !== "currentOnly") addCode(this.getScriptPartFromCode(code));
        if (this.options.load !== "currentOnly") addCode(this.getLanguagePartFromCode(code));
      } else if (isString(code)) {
        addCode(this.formatLanguageCode(code));
      }
      fallbackCodes.forEach((fc) => {
        if (codes.indexOf(fc) < 0) addCode(this.formatLanguageCode(fc));
      });
      return codes;
    }
  };
  var suffixesOrder = {
    zero: 0,
    one: 1,
    two: 2,
    few: 3,
    many: 4,
    other: 5
  };
  var dummyRule = {
    select: (count) => count === 1 ? "one" : "other",
    resolvedOptions: () => ({
      pluralCategories: ["one", "other"]
    })
  };
  var PluralResolver = class {
    constructor(languageUtils, options = {}) {
      this.languageUtils = languageUtils;
      this.options = options;
      this.logger = baseLogger.create("pluralResolver");
      this.pluralRulesCache = {};
    }
    addRule(lng, obj) {
      this.rules[lng] = obj;
    }
    clearCache() {
      this.pluralRulesCache = {};
    }
    getRule(code, options = {}) {
      const cleanedCode = getCleanedCode(code === "dev" ? "en" : code);
      const type = options.ordinal ? "ordinal" : "cardinal";
      const cacheKey = JSON.stringify({
        cleanedCode,
        type
      });
      if (cacheKey in this.pluralRulesCache) {
        return this.pluralRulesCache[cacheKey];
      }
      let rule;
      try {
        rule = new Intl.PluralRules(cleanedCode, {
          type
        });
      } catch (err) {
        if (!Intl) {
          this.logger.error("No Intl support, please use an Intl polyfill!");
          return dummyRule;
        }
        if (!code.match(/-|_/)) return dummyRule;
        const lngPart = this.languageUtils.getLanguagePartFromCode(code);
        rule = this.getRule(lngPart, options);
      }
      this.pluralRulesCache[cacheKey] = rule;
      return rule;
    }
    needsPlural(code, options = {}) {
      let rule = this.getRule(code, options);
      if (!rule) rule = this.getRule("dev", options);
      return rule?.resolvedOptions().pluralCategories.length > 1;
    }
    getPluralFormsOfKey(code, key, options = {}) {
      return this.getSuffixes(code, options).map((suffix) => `${key}${suffix}`);
    }
    getSuffixes(code, options = {}) {
      let rule = this.getRule(code, options);
      if (!rule) rule = this.getRule("dev", options);
      if (!rule) return [];
      return rule.resolvedOptions().pluralCategories.sort((pluralCategory1, pluralCategory2) => suffixesOrder[pluralCategory1] - suffixesOrder[pluralCategory2]).map((pluralCategory) => `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${pluralCategory}`);
    }
    getSuffix(code, count, options = {}) {
      const rule = this.getRule(code, options);
      if (rule) {
        return `${this.options.prepend}${options.ordinal ? `ordinal${this.options.prepend}` : ""}${rule.select(count)}`;
      }
      this.logger.warn(`no plural rule found for: ${code}`);
      return this.getSuffix("dev", count, options);
    }
  };
  var deepFindWithDefaults = (data, defaultData, key, keySeparator = ".", ignoreJSONStructure = true) => {
    let path2 = getPathWithDefaults(data, defaultData, key);
    if (!path2 && ignoreJSONStructure && isString(key)) {
      path2 = deepFind(data, key, keySeparator);
      if (path2 === void 0) path2 = deepFind(defaultData, key, keySeparator);
    }
    return path2;
  };
  var regexSafe = (val) => val.replace(/\$/g, "$$$$");
  var Interpolator = class {
    constructor(options = {}) {
      this.logger = baseLogger.create("interpolator");
      this.options = options;
      this.format = options?.interpolation?.format || ((value) => value);
      this.init(options);
    }
    init(options = {}) {
      if (!options.interpolation) options.interpolation = {
        escapeValue: true
      };
      const {
        escape: escape$1,
        escapeValue,
        useRawValueToEscape,
        prefix,
        prefixEscaped,
        suffix,
        suffixEscaped,
        formatSeparator,
        unescapeSuffix,
        unescapePrefix,
        nestingPrefix,
        nestingPrefixEscaped,
        nestingSuffix,
        nestingSuffixEscaped,
        nestingOptionsSeparator,
        maxReplaces,
        alwaysFormat
      } = options.interpolation;
      this.escape = escape$1 !== void 0 ? escape$1 : escape;
      this.escapeValue = escapeValue !== void 0 ? escapeValue : true;
      this.useRawValueToEscape = useRawValueToEscape !== void 0 ? useRawValueToEscape : false;
      this.prefix = prefix ? regexEscape(prefix) : prefixEscaped || "{{";
      this.suffix = suffix ? regexEscape(suffix) : suffixEscaped || "}}";
      this.formatSeparator = formatSeparator || ",";
      this.unescapePrefix = unescapeSuffix ? "" : unescapePrefix || "-";
      this.unescapeSuffix = this.unescapePrefix ? "" : unescapeSuffix || "";
      this.nestingPrefix = nestingPrefix ? regexEscape(nestingPrefix) : nestingPrefixEscaped || regexEscape("$t(");
      this.nestingSuffix = nestingSuffix ? regexEscape(nestingSuffix) : nestingSuffixEscaped || regexEscape(")");
      this.nestingOptionsSeparator = nestingOptionsSeparator || ",";
      this.maxReplaces = maxReplaces || 1e3;
      this.alwaysFormat = alwaysFormat !== void 0 ? alwaysFormat : false;
      this.resetRegExp();
    }
    reset() {
      if (this.options) this.init(this.options);
    }
    resetRegExp() {
      const getOrResetRegExp = (existingRegExp, pattern) => {
        if (existingRegExp?.source === pattern) {
          existingRegExp.lastIndex = 0;
          return existingRegExp;
        }
        return new RegExp(pattern, "g");
      };
      this.regexp = getOrResetRegExp(this.regexp, `${this.prefix}(.+?)${this.suffix}`);
      this.regexpUnescape = getOrResetRegExp(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`);
      this.nestingRegexp = getOrResetRegExp(this.nestingRegexp, `${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`);
    }
    interpolate(str, data, lng, options) {
      let match;
      let value;
      let replaces;
      const defaultData = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {};
      const handleFormat = (key) => {
        if (key.indexOf(this.formatSeparator) < 0) {
          const path2 = deepFindWithDefaults(data, defaultData, key, this.options.keySeparator, this.options.ignoreJSONStructure);
          return this.alwaysFormat ? this.format(path2, void 0, lng, {
            ...options,
            ...data,
            interpolationkey: key
          }) : path2;
        }
        const p = key.split(this.formatSeparator);
        const k = p.shift().trim();
        const f = p.join(this.formatSeparator).trim();
        return this.format(deepFindWithDefaults(data, defaultData, k, this.options.keySeparator, this.options.ignoreJSONStructure), f, lng, {
          ...options,
          ...data,
          interpolationkey: k
        });
      };
      this.resetRegExp();
      const missingInterpolationHandler = options?.missingInterpolationHandler || this.options.missingInterpolationHandler;
      const skipOnVariables = options?.interpolation?.skipOnVariables !== void 0 ? options.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
      const todos = [{
        regex: this.regexpUnescape,
        safeValue: (val) => regexSafe(val)
      }, {
        regex: this.regexp,
        safeValue: (val) => this.escapeValue ? regexSafe(this.escape(val)) : regexSafe(val)
      }];
      todos.forEach((todo) => {
        replaces = 0;
        while (match = todo.regex.exec(str)) {
          const matchedVar = match[1].trim();
          value = handleFormat(matchedVar);
          if (value === void 0) {
            if (typeof missingInterpolationHandler === "function") {
              const temp = missingInterpolationHandler(str, match, options);
              value = isString(temp) ? temp : "";
            } else if (options && Object.prototype.hasOwnProperty.call(options, matchedVar)) {
              value = "";
            } else if (skipOnVariables) {
              value = match[0];
              continue;
            } else {
              this.logger.warn(`missed to pass in variable ${matchedVar} for interpolating ${str}`);
              value = "";
            }
          } else if (!isString(value) && !this.useRawValueToEscape) {
            value = makeString(value);
          }
          const safeValue = todo.safeValue(value);
          str = str.replace(match[0], safeValue);
          if (skipOnVariables) {
            todo.regex.lastIndex += value.length;
            todo.regex.lastIndex -= match[0].length;
          } else {
            todo.regex.lastIndex = 0;
          }
          replaces++;
          if (replaces >= this.maxReplaces) {
            break;
          }
        }
      });
      return str;
    }
    nest(str, fc, options = {}) {
      let match;
      let value;
      let clonedOptions;
      const handleHasOptions = (key, inheritedOptions) => {
        const sep = this.nestingOptionsSeparator;
        if (key.indexOf(sep) < 0) return key;
        const c = key.split(new RegExp(`${sep}[ ]*{`));
        let optionsString = `{${c[1]}`;
        key = c[0];
        optionsString = this.interpolate(optionsString, clonedOptions);
        const matchedSingleQuotes = optionsString.match(/'/g);
        const matchedDoubleQuotes = optionsString.match(/"/g);
        if ((matchedSingleQuotes?.length ?? 0) % 2 === 0 && !matchedDoubleQuotes || matchedDoubleQuotes.length % 2 !== 0) {
          optionsString = optionsString.replace(/'/g, '"');
        }
        try {
          clonedOptions = JSON.parse(optionsString);
          if (inheritedOptions) clonedOptions = {
            ...inheritedOptions,
            ...clonedOptions
          };
        } catch (e2) {
          this.logger.warn(`failed parsing options string in nesting for key ${key}`, e2);
          return `${key}${sep}${optionsString}`;
        }
        if (clonedOptions.defaultValue && clonedOptions.defaultValue.indexOf(this.prefix) > -1) delete clonedOptions.defaultValue;
        return key;
      };
      while (match = this.nestingRegexp.exec(str)) {
        let formatters = [];
        clonedOptions = {
          ...options
        };
        clonedOptions = clonedOptions.replace && !isString(clonedOptions.replace) ? clonedOptions.replace : clonedOptions;
        clonedOptions.applyPostProcessor = false;
        delete clonedOptions.defaultValue;
        const keyEndIndex = /{.*}/.test(match[1]) ? match[1].lastIndexOf("}") + 1 : match[1].indexOf(this.formatSeparator);
        if (keyEndIndex !== -1) {
          formatters = match[1].slice(keyEndIndex).split(this.formatSeparator).map((elem) => elem.trim()).filter(Boolean);
          match[1] = match[1].slice(0, keyEndIndex);
        }
        value = fc(handleHasOptions.call(this, match[1].trim(), clonedOptions), clonedOptions);
        if (value && match[0] === str && !isString(value)) return value;
        if (!isString(value)) value = makeString(value);
        if (!value) {
          this.logger.warn(`missed to resolve ${match[1]} for nesting ${str}`);
          value = "";
        }
        if (formatters.length) {
          value = formatters.reduce((v, f) => this.format(v, f, options.lng, {
            ...options,
            interpolationkey: match[1].trim()
          }), value.trim());
        }
        str = str.replace(match[0], value);
        this.regexp.lastIndex = 0;
      }
      return str;
    }
  };
  var parseFormatStr = (formatStr) => {
    let formatName = formatStr.toLowerCase().trim();
    const formatOptions = {};
    if (formatStr.indexOf("(") > -1) {
      const p = formatStr.split("(");
      formatName = p[0].toLowerCase().trim();
      const optStr = p[1].substring(0, p[1].length - 1);
      if (formatName === "currency" && optStr.indexOf(":") < 0) {
        if (!formatOptions.currency) formatOptions.currency = optStr.trim();
      } else if (formatName === "relativetime" && optStr.indexOf(":") < 0) {
        if (!formatOptions.range) formatOptions.range = optStr.trim();
      } else {
        const opts = optStr.split(";");
        opts.forEach((opt) => {
          if (opt) {
            const [key, ...rest] = opt.split(":");
            const val = rest.join(":").trim().replace(/^'+|'+$/g, "");
            const trimmedKey = key.trim();
            if (!formatOptions[trimmedKey]) formatOptions[trimmedKey] = val;
            if (val === "false") formatOptions[trimmedKey] = false;
            if (val === "true") formatOptions[trimmedKey] = true;
            if (!isNaN(val)) formatOptions[trimmedKey] = parseInt(val, 10);
          }
        });
      }
    }
    return {
      formatName,
      formatOptions
    };
  };
  var createCachedFormatter = (fn) => {
    const cache = {};
    return (v, l, o) => {
      let optForCache = o;
      if (o && o.interpolationkey && o.formatParams && o.formatParams[o.interpolationkey] && o[o.interpolationkey]) {
        optForCache = {
          ...optForCache,
          [o.interpolationkey]: void 0
        };
      }
      const key = l + JSON.stringify(optForCache);
      let frm = cache[key];
      if (!frm) {
        frm = fn(getCleanedCode(l), o);
        cache[key] = frm;
      }
      return frm(v);
    };
  };
  var createNonCachedFormatter = (fn) => (v, l, o) => fn(getCleanedCode(l), o)(v);
  var Formatter = class {
    constructor(options = {}) {
      this.logger = baseLogger.create("formatter");
      this.options = options;
      this.init(options);
    }
    init(services, options = {
      interpolation: {}
    }) {
      this.formatSeparator = options.interpolation.formatSeparator || ",";
      const cf = options.cacheInBuiltFormats ? createCachedFormatter : createNonCachedFormatter;
      this.formats = {
        number: cf((lng, opt) => {
          const formatter = new Intl.NumberFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val);
        }),
        currency: cf((lng, opt) => {
          const formatter = new Intl.NumberFormat(lng, {
            ...opt,
            style: "currency"
          });
          return (val) => formatter.format(val);
        }),
        datetime: cf((lng, opt) => {
          const formatter = new Intl.DateTimeFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val);
        }),
        relativetime: cf((lng, opt) => {
          const formatter = new Intl.RelativeTimeFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val, opt.range || "day");
        }),
        list: cf((lng, opt) => {
          const formatter = new Intl.ListFormat(lng, {
            ...opt
          });
          return (val) => formatter.format(val);
        })
      };
    }
    add(name, fc) {
      this.formats[name.toLowerCase().trim()] = fc;
    }
    addCached(name, fc) {
      this.formats[name.toLowerCase().trim()] = createCachedFormatter(fc);
    }
    format(value, format, lng, options = {}) {
      const formats = format.split(this.formatSeparator);
      if (formats.length > 1 && formats[0].indexOf("(") > 1 && formats[0].indexOf(")") < 0 && formats.find((f) => f.indexOf(")") > -1)) {
        const lastIndex = formats.findIndex((f) => f.indexOf(")") > -1);
        formats[0] = [formats[0], ...formats.splice(1, lastIndex)].join(this.formatSeparator);
      }
      const result = formats.reduce((mem, f) => {
        const {
          formatName,
          formatOptions
        } = parseFormatStr(f);
        if (this.formats[formatName]) {
          let formatted = mem;
          try {
            const valOptions = options?.formatParams?.[options.interpolationkey] || {};
            const l = valOptions.locale || valOptions.lng || options.locale || options.lng || lng;
            formatted = this.formats[formatName](mem, l, {
              ...formatOptions,
              ...options,
              ...valOptions
            });
          } catch (error) {
            this.logger.warn(error);
          }
          return formatted;
        } else {
          this.logger.warn(`there was no format function for ${formatName}`);
        }
        return mem;
      }, value);
      return result;
    }
  };
  var removePending = (q, name) => {
    if (q.pending[name] !== void 0) {
      delete q.pending[name];
      q.pendingCount--;
    }
  };
  var Connector = class extends EventEmitter {
    constructor(backend, store, services, options = {}) {
      super();
      this.backend = backend;
      this.store = store;
      this.services = services;
      this.languageUtils = services.languageUtils;
      this.options = options;
      this.logger = baseLogger.create("backendConnector");
      this.waitingReads = [];
      this.maxParallelReads = options.maxParallelReads || 10;
      this.readingCalls = 0;
      this.maxRetries = options.maxRetries >= 0 ? options.maxRetries : 5;
      this.retryTimeout = options.retryTimeout >= 1 ? options.retryTimeout : 350;
      this.state = {};
      this.queue = [];
      this.backend?.init?.(services, options.backend, options);
    }
    queueLoad(languages, namespaces, options, callback) {
      const toLoad = {};
      const pending = {};
      const toLoadLanguages = {};
      const toLoadNamespaces = {};
      languages.forEach((lng) => {
        let hasAllNamespaces = true;
        namespaces.forEach((ns) => {
          const name = `${lng}|${ns}`;
          if (!options.reload && this.store.hasResourceBundle(lng, ns)) {
            this.state[name] = 2;
          } else if (this.state[name] < 0) ;
          else if (this.state[name] === 1) {
            if (pending[name] === void 0) pending[name] = true;
          } else {
            this.state[name] = 1;
            hasAllNamespaces = false;
            if (pending[name] === void 0) pending[name] = true;
            if (toLoad[name] === void 0) toLoad[name] = true;
            if (toLoadNamespaces[ns] === void 0) toLoadNamespaces[ns] = true;
          }
        });
        if (!hasAllNamespaces) toLoadLanguages[lng] = true;
      });
      if (Object.keys(toLoad).length || Object.keys(pending).length) {
        this.queue.push({
          pending,
          pendingCount: Object.keys(pending).length,
          loaded: {},
          errors: [],
          callback
        });
      }
      return {
        toLoad: Object.keys(toLoad),
        pending: Object.keys(pending),
        toLoadLanguages: Object.keys(toLoadLanguages),
        toLoadNamespaces: Object.keys(toLoadNamespaces)
      };
    }
    loaded(name, err, data) {
      const s = name.split("|");
      const lng = s[0];
      const ns = s[1];
      if (err) this.emit("failedLoading", lng, ns, err);
      if (!err && data) {
        this.store.addResourceBundle(lng, ns, data, void 0, void 0, {
          skipCopy: true
        });
      }
      this.state[name] = err ? -1 : 2;
      if (err && data) this.state[name] = 0;
      const loaded = {};
      this.queue.forEach((q) => {
        pushPath(q.loaded, [lng], ns);
        removePending(q, name);
        if (err) q.errors.push(err);
        if (q.pendingCount === 0 && !q.done) {
          Object.keys(q.loaded).forEach((l) => {
            if (!loaded[l]) loaded[l] = {};
            const loadedKeys = q.loaded[l];
            if (loadedKeys.length) {
              loadedKeys.forEach((n) => {
                if (loaded[l][n] === void 0) loaded[l][n] = true;
              });
            }
          });
          q.done = true;
          if (q.errors.length) {
            q.callback(q.errors);
          } else {
            q.callback();
          }
        }
      });
      this.emit("loaded", loaded);
      this.queue = this.queue.filter((q) => !q.done);
    }
    read(lng, ns, fcName, tried = 0, wait = this.retryTimeout, callback) {
      if (!lng.length) return callback(null, {});
      if (this.readingCalls >= this.maxParallelReads) {
        this.waitingReads.push({
          lng,
          ns,
          fcName,
          tried,
          wait,
          callback
        });
        return;
      }
      this.readingCalls++;
      const resolver = (err, data) => {
        this.readingCalls--;
        if (this.waitingReads.length > 0) {
          const next = this.waitingReads.shift();
          this.read(next.lng, next.ns, next.fcName, next.tried, next.wait, next.callback);
        }
        if (err && data && tried < this.maxRetries) {
          setTimeout(() => {
            this.read.call(this, lng, ns, fcName, tried + 1, wait * 2, callback);
          }, wait);
          return;
        }
        callback(err, data);
      };
      const fc = this.backend[fcName].bind(this.backend);
      if (fc.length === 2) {
        try {
          const r = fc(lng, ns);
          if (r && typeof r.then === "function") {
            r.then((data) => resolver(null, data)).catch(resolver);
          } else {
            resolver(null, r);
          }
        } catch (err) {
          resolver(err);
        }
        return;
      }
      return fc(lng, ns, resolver);
    }
    prepareLoading(languages, namespaces, options = {}, callback) {
      if (!this.backend) {
        this.logger.warn("No backend was added via i18next.use. Will not load resources.");
        return callback && callback();
      }
      if (isString(languages)) languages = this.languageUtils.toResolveHierarchy(languages);
      if (isString(namespaces)) namespaces = [namespaces];
      const toLoad = this.queueLoad(languages, namespaces, options, callback);
      if (!toLoad.toLoad.length) {
        if (!toLoad.pending.length) callback();
        return null;
      }
      toLoad.toLoad.forEach((name) => {
        this.loadOne(name);
      });
    }
    load(languages, namespaces, callback) {
      this.prepareLoading(languages, namespaces, {}, callback);
    }
    reload(languages, namespaces, callback) {
      this.prepareLoading(languages, namespaces, {
        reload: true
      }, callback);
    }
    loadOne(name, prefix = "") {
      const s = name.split("|");
      const lng = s[0];
      const ns = s[1];
      this.read(lng, ns, "read", void 0, void 0, (err, data) => {
        if (err) this.logger.warn(`${prefix}loading namespace ${ns} for language ${lng} failed`, err);
        if (!err && data) this.logger.log(`${prefix}loaded namespace ${ns} for language ${lng}`, data);
        this.loaded(name, err, data);
      });
    }
    saveMissing(languages, namespace, key, fallbackValue, isUpdate, options = {}, clb = () => {
    }) {
      if (this.services?.utils?.hasLoadedNamespace && !this.services?.utils?.hasLoadedNamespace(namespace)) {
        this.logger.warn(`did not save key "${key}" as the namespace "${namespace}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
        return;
      }
      if (key === void 0 || key === null || key === "") return;
      if (this.backend?.create) {
        const opts = {
          ...options,
          isUpdate
        };
        const fc = this.backend.create.bind(this.backend);
        if (fc.length < 6) {
          try {
            let r;
            if (fc.length === 5) {
              r = fc(languages, namespace, key, fallbackValue, opts);
            } else {
              r = fc(languages, namespace, key, fallbackValue);
            }
            if (r && typeof r.then === "function") {
              r.then((data) => clb(null, data)).catch(clb);
            } else {
              clb(null, r);
            }
          } catch (err) {
            clb(err);
          }
        } else {
          fc(languages, namespace, key, fallbackValue, clb, opts);
        }
      }
      if (!languages || !languages[0]) return;
      this.store.addResource(languages[0], namespace, key, fallbackValue);
    }
  };
  var get = () => ({
    debug: false,
    initAsync: true,
    ns: ["translation"],
    defaultNS: ["translation"],
    fallbackLng: ["dev"],
    fallbackNS: false,
    supportedLngs: false,
    nonExplicitSupportedLngs: false,
    load: "all",
    preload: false,
    simplifyPluralSuffix: true,
    keySeparator: ".",
    nsSeparator: ":",
    pluralSeparator: "_",
    contextSeparator: "_",
    partialBundledLanguages: false,
    saveMissing: false,
    updateMissing: false,
    saveMissingTo: "fallback",
    saveMissingPlurals: true,
    missingKeyHandler: false,
    missingInterpolationHandler: false,
    postProcess: false,
    postProcessPassResolved: false,
    returnNull: false,
    returnEmptyString: true,
    returnObjects: false,
    joinArrays: false,
    returnedObjectHandler: false,
    parseMissingKeyHandler: false,
    appendNamespaceToMissingKey: false,
    appendNamespaceToCIMode: false,
    overloadTranslationOptionHandler: (args) => {
      let ret = {};
      if (typeof args[1] === "object") ret = args[1];
      if (isString(args[1])) ret.defaultValue = args[1];
      if (isString(args[2])) ret.tDescription = args[2];
      if (typeof args[2] === "object" || typeof args[3] === "object") {
        const options = args[3] || args[2];
        Object.keys(options).forEach((key) => {
          ret[key] = options[key];
        });
      }
      return ret;
    },
    interpolation: {
      escapeValue: true,
      format: (value) => value,
      prefix: "{{",
      suffix: "}}",
      formatSeparator: ",",
      unescapePrefix: "-",
      nestingPrefix: "$t(",
      nestingSuffix: ")",
      nestingOptionsSeparator: ",",
      maxReplaces: 1e3,
      skipOnVariables: true
    },
    cacheInBuiltFormats: true
  });
  var transformOptions = (options) => {
    if (isString(options.ns)) options.ns = [options.ns];
    if (isString(options.fallbackLng)) options.fallbackLng = [options.fallbackLng];
    if (isString(options.fallbackNS)) options.fallbackNS = [options.fallbackNS];
    if (options.supportedLngs?.indexOf?.("cimode") < 0) {
      options.supportedLngs = options.supportedLngs.concat(["cimode"]);
    }
    if (typeof options.initImmediate === "boolean") options.initAsync = options.initImmediate;
    return options;
  };
  var noop = () => {
  };
  var bindMemberFunctions = (inst) => {
    const mems = Object.getOwnPropertyNames(Object.getPrototypeOf(inst));
    mems.forEach((mem) => {
      if (typeof inst[mem] === "function") {
        inst[mem] = inst[mem].bind(inst);
      }
    });
  };
  var I18n = class _I18n extends EventEmitter {
    constructor(options = {}, callback) {
      super();
      this.options = transformOptions(options);
      this.services = {};
      this.logger = baseLogger;
      this.modules = {
        external: []
      };
      bindMemberFunctions(this);
      if (callback && !this.isInitialized && !options.isClone) {
        if (!this.options.initAsync) {
          this.init(options, callback);
          return this;
        }
        setTimeout(() => {
          this.init(options, callback);
        }, 0);
      }
    }
    init(options = {}, callback) {
      this.isInitializing = true;
      if (typeof options === "function") {
        callback = options;
        options = {};
      }
      if (options.defaultNS == null && options.ns) {
        if (isString(options.ns)) {
          options.defaultNS = options.ns;
        } else if (options.ns.indexOf("translation") < 0) {
          options.defaultNS = options.ns[0];
        }
      }
      const defOpts = get();
      this.options = {
        ...defOpts,
        ...this.options,
        ...transformOptions(options)
      };
      this.options.interpolation = {
        ...defOpts.interpolation,
        ...this.options.interpolation
      };
      if (options.keySeparator !== void 0) {
        this.options.userDefinedKeySeparator = options.keySeparator;
      }
      if (options.nsSeparator !== void 0) {
        this.options.userDefinedNsSeparator = options.nsSeparator;
      }
      const createClassOnDemand = (ClassOrObject) => {
        if (!ClassOrObject) return null;
        if (typeof ClassOrObject === "function") return new ClassOrObject();
        return ClassOrObject;
      };
      if (!this.options.isClone) {
        if (this.modules.logger) {
          baseLogger.init(createClassOnDemand(this.modules.logger), this.options);
        } else {
          baseLogger.init(null, this.options);
        }
        let formatter;
        if (this.modules.formatter) {
          formatter = this.modules.formatter;
        } else {
          formatter = Formatter;
        }
        const lu = new LanguageUtil(this.options);
        this.store = new ResourceStore(this.options.resources, this.options);
        const s = this.services;
        s.logger = baseLogger;
        s.resourceStore = this.store;
        s.languageUtils = lu;
        s.pluralResolver = new PluralResolver(lu, {
          prepend: this.options.pluralSeparator,
          simplifyPluralSuffix: this.options.simplifyPluralSuffix
        });
        const usingLegacyFormatFunction = this.options.interpolation.format && this.options.interpolation.format !== defOpts.interpolation.format;
        if (usingLegacyFormatFunction) {
          this.logger.deprecate(`init: you are still using the legacy format function, please use the new approach: https://www.i18next.com/translation-function/formatting`);
        }
        if (formatter && (!this.options.interpolation.format || this.options.interpolation.format === defOpts.interpolation.format)) {
          s.formatter = createClassOnDemand(formatter);
          if (s.formatter.init) s.formatter.init(s, this.options);
          this.options.interpolation.format = s.formatter.format.bind(s.formatter);
        }
        s.interpolator = new Interpolator(this.options);
        s.utils = {
          hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
        };
        s.backendConnector = new Connector(createClassOnDemand(this.modules.backend), s.resourceStore, s, this.options);
        s.backendConnector.on("*", (event, ...args) => {
          this.emit(event, ...args);
        });
        if (this.modules.languageDetector) {
          s.languageDetector = createClassOnDemand(this.modules.languageDetector);
          if (s.languageDetector.init) s.languageDetector.init(s, this.options.detection, this.options);
        }
        if (this.modules.i18nFormat) {
          s.i18nFormat = createClassOnDemand(this.modules.i18nFormat);
          if (s.i18nFormat.init) s.i18nFormat.init(this);
        }
        this.translator = new Translator(this.services, this.options);
        this.translator.on("*", (event, ...args) => {
          this.emit(event, ...args);
        });
        this.modules.external.forEach((m) => {
          if (m.init) m.init(this);
        });
      }
      this.format = this.options.interpolation.format;
      if (!callback) callback = noop;
      if (this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
        const codes = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
        if (codes.length > 0 && codes[0] !== "dev") this.options.lng = codes[0];
      }
      if (!this.services.languageDetector && !this.options.lng) {
        this.logger.warn("init: no languageDetector is used and no lng is defined");
      }
      const storeApi = ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"];
      storeApi.forEach((fcName) => {
        this[fcName] = (...args) => this.store[fcName](...args);
      });
      const storeApiChained = ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"];
      storeApiChained.forEach((fcName) => {
        this[fcName] = (...args) => {
          this.store[fcName](...args);
          return this;
        };
      });
      const deferred = defer();
      const load = () => {
        const finish = (err, t2) => {
          this.isInitializing = false;
          if (this.isInitialized && !this.initializedStoreOnce) this.logger.warn("init: i18next is already initialized. You should call init just once!");
          this.isInitialized = true;
          if (!this.options.isClone) this.logger.log("initialized", this.options);
          this.emit("initialized", this.options);
          deferred.resolve(t2);
          callback(err, t2);
        };
        if (this.languages && !this.isInitialized) return finish(null, this.t.bind(this));
        this.changeLanguage(this.options.lng, finish);
      };
      if (this.options.resources || !this.options.initAsync) {
        load();
      } else {
        setTimeout(load, 0);
      }
      return deferred;
    }
    loadResources(language, callback = noop) {
      let usedCallback = callback;
      const usedLng = isString(language) ? language : this.language;
      if (typeof language === "function") usedCallback = language;
      if (!this.options.resources || this.options.partialBundledLanguages) {
        if (usedLng?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0)) return usedCallback();
        const toLoad = [];
        const append = (lng) => {
          if (!lng) return;
          if (lng === "cimode") return;
          const lngs = this.services.languageUtils.toResolveHierarchy(lng);
          lngs.forEach((l) => {
            if (l === "cimode") return;
            if (toLoad.indexOf(l) < 0) toLoad.push(l);
          });
        };
        if (!usedLng) {
          const fallbacks = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
          fallbacks.forEach((l) => append(l));
        } else {
          append(usedLng);
        }
        this.options.preload?.forEach?.((l) => append(l));
        this.services.backendConnector.load(toLoad, this.options.ns, (e2) => {
          if (!e2 && !this.resolvedLanguage && this.language) this.setResolvedLanguage(this.language);
          usedCallback(e2);
        });
      } else {
        usedCallback(null);
      }
    }
    reloadResources(lngs, ns, callback) {
      const deferred = defer();
      if (typeof lngs === "function") {
        callback = lngs;
        lngs = void 0;
      }
      if (typeof ns === "function") {
        callback = ns;
        ns = void 0;
      }
      if (!lngs) lngs = this.languages;
      if (!ns) ns = this.options.ns;
      if (!callback) callback = noop;
      this.services.backendConnector.reload(lngs, ns, (err) => {
        deferred.resolve();
        callback(err);
      });
      return deferred;
    }
    use(module) {
      if (!module) throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
      if (!module.type) throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
      if (module.type === "backend") {
        this.modules.backend = module;
      }
      if (module.type === "logger" || module.log && module.warn && module.error) {
        this.modules.logger = module;
      }
      if (module.type === "languageDetector") {
        this.modules.languageDetector = module;
      }
      if (module.type === "i18nFormat") {
        this.modules.i18nFormat = module;
      }
      if (module.type === "postProcessor") {
        postProcessor.addPostProcessor(module);
      }
      if (module.type === "formatter") {
        this.modules.formatter = module;
      }
      if (module.type === "3rdParty") {
        this.modules.external.push(module);
      }
      return this;
    }
    setResolvedLanguage(l) {
      if (!l || !this.languages) return;
      if (["cimode", "dev"].indexOf(l) > -1) return;
      for (let li = 0; li < this.languages.length; li++) {
        const lngInLngs = this.languages[li];
        if (["cimode", "dev"].indexOf(lngInLngs) > -1) continue;
        if (this.store.hasLanguageSomeTranslations(lngInLngs)) {
          this.resolvedLanguage = lngInLngs;
          break;
        }
      }
      if (!this.resolvedLanguage && this.languages.indexOf(l) < 0 && this.store.hasLanguageSomeTranslations(l)) {
        this.resolvedLanguage = l;
        this.languages.unshift(l);
      }
    }
    changeLanguage(lng, callback) {
      this.isLanguageChangingTo = lng;
      const deferred = defer();
      this.emit("languageChanging", lng);
      const setLngProps = (l) => {
        this.language = l;
        this.languages = this.services.languageUtils.toResolveHierarchy(l);
        this.resolvedLanguage = void 0;
        this.setResolvedLanguage(l);
      };
      const done = (err, l) => {
        if (l) {
          if (this.isLanguageChangingTo === lng) {
            setLngProps(l);
            this.translator.changeLanguage(l);
            this.isLanguageChangingTo = void 0;
            this.emit("languageChanged", l);
            this.logger.log("languageChanged", l);
          }
        } else {
          this.isLanguageChangingTo = void 0;
        }
        deferred.resolve((...args) => this.t(...args));
        if (callback) callback(err, (...args) => this.t(...args));
      };
      const setLng = (lngs) => {
        if (!lng && !lngs && this.services.languageDetector) lngs = [];
        const fl = isString(lngs) ? lngs : lngs && lngs[0];
        const l = this.store.hasLanguageSomeTranslations(fl) ? fl : this.services.languageUtils.getBestMatchFromCodes(isString(lngs) ? [lngs] : lngs);
        if (l) {
          if (!this.language) {
            setLngProps(l);
          }
          if (!this.translator.language) this.translator.changeLanguage(l);
          this.services.languageDetector?.cacheUserLanguage?.(l);
        }
        this.loadResources(l, (err) => {
          done(err, l);
        });
      };
      if (!lng && this.services.languageDetector && !this.services.languageDetector.async) {
        setLng(this.services.languageDetector.detect());
      } else if (!lng && this.services.languageDetector && this.services.languageDetector.async) {
        if (this.services.languageDetector.detect.length === 0) {
          this.services.languageDetector.detect().then(setLng);
        } else {
          this.services.languageDetector.detect(setLng);
        }
      } else {
        setLng(lng);
      }
      return deferred;
    }
    getFixedT(lng, ns, keyPrefix) {
      const fixedT = (key, opts, ...rest) => {
        let o;
        if (typeof opts !== "object") {
          o = this.options.overloadTranslationOptionHandler([key, opts].concat(rest));
        } else {
          o = {
            ...opts
          };
        }
        o.lng = o.lng || fixedT.lng;
        o.lngs = o.lngs || fixedT.lngs;
        o.ns = o.ns || fixedT.ns;
        if (o.keyPrefix !== "") o.keyPrefix = o.keyPrefix || keyPrefix || fixedT.keyPrefix;
        const keySeparator = this.options.keySeparator || ".";
        let resultKey;
        if (o.keyPrefix && Array.isArray(key)) {
          resultKey = key.map((k) => {
            if (typeof k === "function") k = keysFromSelector(k, {
              ...this.options,
              ...opts
            });
            return `${o.keyPrefix}${keySeparator}${k}`;
          });
        } else {
          if (typeof key === "function") key = keysFromSelector(key, {
            ...this.options,
            ...opts
          });
          resultKey = o.keyPrefix ? `${o.keyPrefix}${keySeparator}${key}` : key;
        }
        return this.t(resultKey, o);
      };
      if (isString(lng)) {
        fixedT.lng = lng;
      } else {
        fixedT.lngs = lng;
      }
      fixedT.ns = ns;
      fixedT.keyPrefix = keyPrefix;
      return fixedT;
    }
    t(...args) {
      return this.translator?.translate(...args);
    }
    exists(...args) {
      return this.translator?.exists(...args);
    }
    setDefaultNamespace(ns) {
      this.options.defaultNS = ns;
    }
    hasLoadedNamespace(ns, options = {}) {
      if (!this.isInitialized) {
        this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages);
        return false;
      }
      if (!this.languages || !this.languages.length) {
        this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages);
        return false;
      }
      const lng = options.lng || this.resolvedLanguage || this.languages[0];
      const fallbackLng = this.options ? this.options.fallbackLng : false;
      const lastLng = this.languages[this.languages.length - 1];
      if (lng.toLowerCase() === "cimode") return true;
      const loadNotPending = (l, n) => {
        const loadState = this.services.backendConnector.state[`${l}|${n}`];
        return loadState === -1 || loadState === 0 || loadState === 2;
      };
      if (options.precheck) {
        const preResult = options.precheck(this, loadNotPending);
        if (preResult !== void 0) return preResult;
      }
      if (this.hasResourceBundle(lng, ns)) return true;
      if (!this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages) return true;
      if (loadNotPending(lng, ns) && (!fallbackLng || loadNotPending(lastLng, ns))) return true;
      return false;
    }
    loadNamespaces(ns, callback) {
      const deferred = defer();
      if (!this.options.ns) {
        if (callback) callback();
        return Promise.resolve();
      }
      if (isString(ns)) ns = [ns];
      ns.forEach((n) => {
        if (this.options.ns.indexOf(n) < 0) this.options.ns.push(n);
      });
      this.loadResources((err) => {
        deferred.resolve();
        if (callback) callback(err);
      });
      return deferred;
    }
    loadLanguages(lngs, callback) {
      const deferred = defer();
      if (isString(lngs)) lngs = [lngs];
      const preloaded = this.options.preload || [];
      const newLngs = lngs.filter((lng) => preloaded.indexOf(lng) < 0 && this.services.languageUtils.isSupportedCode(lng));
      if (!newLngs.length) {
        if (callback) callback();
        return Promise.resolve();
      }
      this.options.preload = preloaded.concat(newLngs);
      this.loadResources((err) => {
        deferred.resolve();
        if (callback) callback(err);
      });
      return deferred;
    }
    dir(lng) {
      if (!lng) lng = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language);
      if (!lng) return "rtl";
      try {
        const l = new Intl.Locale(lng);
        if (l && l.getTextInfo) {
          const ti = l.getTextInfo();
          if (ti && ti.direction) return ti.direction;
        }
      } catch (e2) {
      }
      const rtlLngs = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"];
      const languageUtils = this.services?.languageUtils || new LanguageUtil(get());
      if (lng.toLowerCase().indexOf("-latn") > 1) return "ltr";
      return rtlLngs.indexOf(languageUtils.getLanguagePartFromCode(lng)) > -1 || lng.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr";
    }
    static createInstance(options = {}, callback) {
      return new _I18n(options, callback);
    }
    cloneInstance(options = {}, callback = noop) {
      const forkResourceStore = options.forkResourceStore;
      if (forkResourceStore) delete options.forkResourceStore;
      const mergedOptions = {
        ...this.options,
        ...options,
        ...{
          isClone: true
        }
      };
      const clone = new _I18n(mergedOptions);
      if (options.debug !== void 0 || options.prefix !== void 0) {
        clone.logger = clone.logger.clone(options);
      }
      const membersToCopy = ["store", "services", "language"];
      membersToCopy.forEach((m) => {
        clone[m] = this[m];
      });
      clone.services = {
        ...this.services
      };
      clone.services.utils = {
        hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
      };
      if (forkResourceStore) {
        const clonedData = Object.keys(this.store.data).reduce((prev, l) => {
          prev[l] = {
            ...this.store.data[l]
          };
          prev[l] = Object.keys(prev[l]).reduce((acc, n) => {
            acc[n] = {
              ...prev[l][n]
            };
            return acc;
          }, prev[l]);
          return prev;
        }, {});
        clone.store = new ResourceStore(clonedData, mergedOptions);
        clone.services.resourceStore = clone.store;
      }
      clone.translator = new Translator(clone.services, mergedOptions);
      clone.translator.on("*", (event, ...args) => {
        clone.emit(event, ...args);
      });
      clone.init(mergedOptions, callback);
      clone.translator.options = mergedOptions;
      clone.translator.backendConnector.services.utils = {
        hasLoadedNamespace: clone.hasLoadedNamespace.bind(clone)
      };
      return clone;
    }
    toJSON() {
      return {
        options: this.options,
        store: this.store,
        language: this.language,
        languages: this.languages,
        resolvedLanguage: this.resolvedLanguage
      };
    }
  };
  var instance = I18n.createInstance();
  instance.createInstance = I18n.createInstance;
  var createInstance = instance.createInstance;
  var dir = instance.dir;
  var init = instance.init;
  var loadResources = instance.loadResources;
  var reloadResources = instance.reloadResources;
  var use = instance.use;
  var changeLanguage = instance.changeLanguage;
  var getFixedT = instance.getFixedT;
  var t = instance.t;
  var exists = instance.exists;
  var setDefaultNamespace = instance.setDefaultNamespace;
  var hasLoadedNamespace = instance.hasLoadedNamespace;
  var loadNamespaces = instance.loadNamespaces;
  var loadLanguages = instance.loadLanguages;

  // node_modules/react-i18next/dist/es/Trans.js
  var import_react3 = __toESM(require_react(), 1);

  // node_modules/react-i18next/dist/es/TransWithoutContext.js
  var import_react = __toESM(require_react(), 1);

  // node_modules/html-parse-stringify/dist/html-parse-stringify.module.js
  var import_void_elements = __toESM(require_void_elements());

  // node_modules/react-i18next/dist/es/unescape.js
  var matchHtmlEntity = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g;
  var htmlEntities = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"',
    "&nbsp;": " ",
    "&#160;": " ",
    "&copy;": "\xA9",
    "&#169;": "\xA9",
    "&reg;": "\xAE",
    "&#174;": "\xAE",
    "&hellip;": "\u2026",
    "&#8230;": "\u2026",
    "&#x2F;": "/",
    "&#47;": "/"
  };
  var unescapeHtmlEntity = (m) => htmlEntities[m];
  var unescape = (text) => text.replace(matchHtmlEntity, unescapeHtmlEntity);

  // node_modules/react-i18next/dist/es/defaults.js
  var defaultOptions = {
    bindI18n: "languageChanged",
    bindI18nStore: "",
    transEmptyNodeValue: "",
    transSupportBasicHtmlNodes: true,
    transWrapTextNodes: "",
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
    useSuspense: true,
    unescape
  };
  var setDefaults = (options = {}) => {
    defaultOptions = {
      ...defaultOptions,
      ...options
    };
  };

  // node_modules/react-i18next/dist/es/i18nInstance.js
  var i18nInstance;
  var setI18n = (instance2) => {
    i18nInstance = instance2;
  };

  // node_modules/react-i18next/dist/es/context.js
  var import_react2 = __toESM(require_react(), 1);

  // node_modules/react-i18next/dist/es/initReactI18next.js
  var initReactI18next = {
    type: "3rdParty",
    init(instance2) {
      setDefaults(instance2.options.react);
      setI18n(instance2);
    }
  };

  // node_modules/react-i18next/dist/es/context.js
  var I18nContext = (0, import_react2.createContext)();

  // node_modules/react-i18next/dist/es/useTranslation.js
  var import_react4 = __toESM(require_react(), 1);

  // node_modules/react-i18next/dist/es/withTranslation.js
  var import_react5 = __toESM(require_react(), 1);

  // node_modules/react-i18next/dist/es/I18nextProvider.js
  var import_react6 = __toESM(require_react(), 1);

  // node_modules/react-i18next/dist/es/withSSR.js
  var import_react8 = __toESM(require_react(), 1);

  // node_modules/react-i18next/dist/es/useSSR.js
  var import_react7 = __toESM(require_react(), 1);

  // node_modules/i18next-browser-languagedetector/dist/esm/i18nextBrowserLanguageDetector.js
  var {
    slice,
    forEach
  } = [];
  function defaults(obj) {
    forEach.call(slice.call(arguments, 1), (source) => {
      if (source) {
        for (const prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  }
  function hasXSS(input) {
    if (typeof input !== "string") return false;
    const xssPatterns = [/<\s*script.*?>/i, /<\s*\/\s*script\s*>/i, /<\s*img.*?on\w+\s*=/i, /<\s*\w+\s*on\w+\s*=.*?>/i, /javascript\s*:/i, /vbscript\s*:/i, /expression\s*\(/i, /eval\s*\(/i, /alert\s*\(/i, /document\.cookie/i, /document\.write\s*\(/i, /window\.location/i, /innerHTML/i];
    return xssPatterns.some((pattern) => pattern.test(input));
  }
  var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  var serializeCookie = function(name, val) {
    let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
      path: "/"
    };
    const opt = options;
    const value = encodeURIComponent(val);
    let str = `${name}=${value}`;
    if (opt.maxAge > 0) {
      const maxAge = opt.maxAge - 0;
      if (Number.isNaN(maxAge)) throw new Error("maxAge should be a Number");
      str += `; Max-Age=${Math.floor(maxAge)}`;
    }
    if (opt.domain) {
      if (!fieldContentRegExp.test(opt.domain)) {
        throw new TypeError("option domain is invalid");
      }
      str += `; Domain=${opt.domain}`;
    }
    if (opt.path) {
      if (!fieldContentRegExp.test(opt.path)) {
        throw new TypeError("option path is invalid");
      }
      str += `; Path=${opt.path}`;
    }
    if (opt.expires) {
      if (typeof opt.expires.toUTCString !== "function") {
        throw new TypeError("option expires is invalid");
      }
      str += `; Expires=${opt.expires.toUTCString()}`;
    }
    if (opt.httpOnly) str += "; HttpOnly";
    if (opt.secure) str += "; Secure";
    if (opt.sameSite) {
      const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
      switch (sameSite) {
        case true:
          str += "; SameSite=Strict";
          break;
        case "lax":
          str += "; SameSite=Lax";
          break;
        case "strict":
          str += "; SameSite=Strict";
          break;
        case "none":
          str += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    if (opt.partitioned) str += "; Partitioned";
    return str;
  };
  var cookie = {
    create(name, value, minutes, domain) {
      let cookieOptions = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {
        path: "/",
        sameSite: "strict"
      };
      if (minutes) {
        cookieOptions.expires = /* @__PURE__ */ new Date();
        cookieOptions.expires.setTime(cookieOptions.expires.getTime() + minutes * 60 * 1e3);
      }
      if (domain) cookieOptions.domain = domain;
      document.cookie = serializeCookie(name, value, cookieOptions);
    },
    read(name) {
      const nameEQ = `${name}=`;
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    },
    remove(name, domain) {
      this.create(name, "", -1, domain);
    }
  };
  var cookie$1 = {
    name: "cookie",
    // Deconstruct the options object and extract the lookupCookie property
    lookup(_ref) {
      let {
        lookupCookie
      } = _ref;
      if (lookupCookie && typeof document !== "undefined") {
        return cookie.read(lookupCookie) || void 0;
      }
      return void 0;
    },
    // Deconstruct the options object and extract the lookupCookie, cookieMinutes, cookieDomain, and cookieOptions properties
    cacheUserLanguage(lng, _ref2) {
      let {
        lookupCookie,
        cookieMinutes,
        cookieDomain,
        cookieOptions
      } = _ref2;
      if (lookupCookie && typeof document !== "undefined") {
        cookie.create(lookupCookie, lng, cookieMinutes, cookieDomain, cookieOptions);
      }
    }
  };
  var querystring = {
    name: "querystring",
    // Deconstruct the options object and extract the lookupQuerystring property
    lookup(_ref) {
      let {
        lookupQuerystring
      } = _ref;
      let found;
      if (typeof window !== "undefined") {
        let {
          search
        } = window.location;
        if (!window.location.search && window.location.hash?.indexOf("?") > -1) {
          search = window.location.hash.substring(window.location.hash.indexOf("?"));
        }
        const query = search.substring(1);
        const params = query.split("&");
        for (let i = 0; i < params.length; i++) {
          const pos = params[i].indexOf("=");
          if (pos > 0) {
            const key = params[i].substring(0, pos);
            if (key === lookupQuerystring) {
              found = params[i].substring(pos + 1);
            }
          }
        }
      }
      return found;
    }
  };
  var hash = {
    name: "hash",
    // Deconstruct the options object and extract the lookupHash property and the lookupFromHashIndex property
    lookup(_ref) {
      let {
        lookupHash,
        lookupFromHashIndex
      } = _ref;
      let found;
      if (typeof window !== "undefined") {
        const {
          hash: hash2
        } = window.location;
        if (hash2 && hash2.length > 2) {
          const query = hash2.substring(1);
          if (lookupHash) {
            const params = query.split("&");
            for (let i = 0; i < params.length; i++) {
              const pos = params[i].indexOf("=");
              if (pos > 0) {
                const key = params[i].substring(0, pos);
                if (key === lookupHash) {
                  found = params[i].substring(pos + 1);
                }
              }
            }
          }
          if (found) return found;
          if (!found && lookupFromHashIndex > -1) {
            const language = hash2.match(/\/([a-zA-Z-]*)/g);
            if (!Array.isArray(language)) return void 0;
            const index = typeof lookupFromHashIndex === "number" ? lookupFromHashIndex : 0;
            return language[index]?.replace("/", "");
          }
        }
      }
      return found;
    }
  };
  var hasLocalStorageSupport = null;
  var localStorageAvailable = () => {
    if (hasLocalStorageSupport !== null) return hasLocalStorageSupport;
    try {
      hasLocalStorageSupport = typeof window !== "undefined" && window.localStorage !== null;
      if (!hasLocalStorageSupport) {
        return false;
      }
      const testKey = "i18next.translate.boo";
      window.localStorage.setItem(testKey, "foo");
      window.localStorage.removeItem(testKey);
    } catch (e2) {
      hasLocalStorageSupport = false;
    }
    return hasLocalStorageSupport;
  };
  var localStorage = {
    name: "localStorage",
    // Deconstruct the options object and extract the lookupLocalStorage property
    lookup(_ref) {
      let {
        lookupLocalStorage
      } = _ref;
      if (lookupLocalStorage && localStorageAvailable()) {
        return window.localStorage.getItem(lookupLocalStorage) || void 0;
      }
      return void 0;
    },
    // Deconstruct the options object and extract the lookupLocalStorage property
    cacheUserLanguage(lng, _ref2) {
      let {
        lookupLocalStorage
      } = _ref2;
      if (lookupLocalStorage && localStorageAvailable()) {
        window.localStorage.setItem(lookupLocalStorage, lng);
      }
    }
  };
  var hasSessionStorageSupport = null;
  var sessionStorageAvailable = () => {
    if (hasSessionStorageSupport !== null) return hasSessionStorageSupport;
    try {
      hasSessionStorageSupport = typeof window !== "undefined" && window.sessionStorage !== null;
      if (!hasSessionStorageSupport) {
        return false;
      }
      const testKey = "i18next.translate.boo";
      window.sessionStorage.setItem(testKey, "foo");
      window.sessionStorage.removeItem(testKey);
    } catch (e2) {
      hasSessionStorageSupport = false;
    }
    return hasSessionStorageSupport;
  };
  var sessionStorage = {
    name: "sessionStorage",
    lookup(_ref) {
      let {
        lookupSessionStorage
      } = _ref;
      if (lookupSessionStorage && sessionStorageAvailable()) {
        return window.sessionStorage.getItem(lookupSessionStorage) || void 0;
      }
      return void 0;
    },
    cacheUserLanguage(lng, _ref2) {
      let {
        lookupSessionStorage
      } = _ref2;
      if (lookupSessionStorage && sessionStorageAvailable()) {
        window.sessionStorage.setItem(lookupSessionStorage, lng);
      }
    }
  };
  var navigator$1 = {
    name: "navigator",
    lookup(options) {
      const found = [];
      if (typeof navigator !== "undefined") {
        const {
          languages,
          userLanguage,
          language
        } = navigator;
        if (languages) {
          for (let i = 0; i < languages.length; i++) {
            found.push(languages[i]);
          }
        }
        if (userLanguage) {
          found.push(userLanguage);
        }
        if (language) {
          found.push(language);
        }
      }
      return found.length > 0 ? found : void 0;
    }
  };
  var htmlTag = {
    name: "htmlTag",
    // Deconstruct the options object and extract the htmlTag property
    lookup(_ref) {
      let {
        htmlTag: htmlTag2
      } = _ref;
      let found;
      const internalHtmlTag = htmlTag2 || (typeof document !== "undefined" ? document.documentElement : null);
      if (internalHtmlTag && typeof internalHtmlTag.getAttribute === "function") {
        found = internalHtmlTag.getAttribute("lang");
      }
      return found;
    }
  };
  var path = {
    name: "path",
    // Deconstruct the options object and extract the lookupFromPathIndex property
    lookup(_ref) {
      let {
        lookupFromPathIndex
      } = _ref;
      if (typeof window === "undefined") return void 0;
      const language = window.location.pathname.match(/\/([a-zA-Z-]*)/g);
      if (!Array.isArray(language)) return void 0;
      const index = typeof lookupFromPathIndex === "number" ? lookupFromPathIndex : 0;
      return language[index]?.replace("/", "");
    }
  };
  var subdomain = {
    name: "subdomain",
    lookup(_ref) {
      let {
        lookupFromSubdomainIndex
      } = _ref;
      const internalLookupFromSubdomainIndex = typeof lookupFromSubdomainIndex === "number" ? lookupFromSubdomainIndex + 1 : 1;
      const language = typeof window !== "undefined" && window.location?.hostname?.match(/^(\w{2,5})\.(([a-z0-9-]{1,63}\.[a-z]{2,6})|localhost)/i);
      if (!language) return void 0;
      return language[internalLookupFromSubdomainIndex];
    }
  };
  var canCookies = false;
  try {
    document.cookie;
    canCookies = true;
  } catch (e2) {
  }
  var order = ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"];
  if (!canCookies) order.splice(1, 1);
  var getDefaults2 = () => ({
    order,
    lookupQuerystring: "lng",
    lookupCookie: "i18next",
    lookupLocalStorage: "i18nextLng",
    lookupSessionStorage: "i18nextLng",
    // cache user language
    caches: ["localStorage"],
    excludeCacheFor: ["cimode"],
    // cookieMinutes: 10,
    // cookieDomain: 'myDomain'
    convertDetectedLanguage: (l) => l
  });
  var Browser = class {
    constructor(services) {
      let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      this.type = "languageDetector";
      this.detectors = {};
      this.init(services, options);
    }
    init() {
      let services = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
        languageUtils: {}
      };
      let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      let i18nOptions = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      this.services = services;
      this.options = defaults(options, this.options || {}, getDefaults2());
      if (typeof this.options.convertDetectedLanguage === "string" && this.options.convertDetectedLanguage.indexOf("15897") > -1) {
        this.options.convertDetectedLanguage = (l) => l.replace("-", "_");
      }
      if (this.options.lookupFromUrlIndex) this.options.lookupFromPathIndex = this.options.lookupFromUrlIndex;
      this.i18nOptions = i18nOptions;
      this.addDetector(cookie$1);
      this.addDetector(querystring);
      this.addDetector(localStorage);
      this.addDetector(sessionStorage);
      this.addDetector(navigator$1);
      this.addDetector(htmlTag);
      this.addDetector(path);
      this.addDetector(subdomain);
      this.addDetector(hash);
    }
    addDetector(detector) {
      this.detectors[detector.name] = detector;
      return this;
    }
    detect() {
      let detectionOrder = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.options.order;
      let detected = [];
      detectionOrder.forEach((detectorName) => {
        if (this.detectors[detectorName]) {
          let lookup = this.detectors[detectorName].lookup(this.options);
          if (lookup && typeof lookup === "string") lookup = [lookup];
          if (lookup) detected = detected.concat(lookup);
        }
      });
      detected = detected.filter((d) => d !== void 0 && d !== null && !hasXSS(d)).map((d) => this.options.convertDetectedLanguage(d));
      if (this.services && this.services.languageUtils && this.services.languageUtils.getBestMatchFromCodes) return detected;
      return detected.length > 0 ? detected[0] : null;
    }
    cacheUserLanguage(lng) {
      let caches = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.options.caches;
      if (!caches) return;
      if (this.options.excludeCacheFor && this.options.excludeCacheFor.indexOf(lng) > -1) return;
      caches.forEach((cacheName) => {
        if (this.detectors[cacheName]) this.detectors[cacheName].cacheUserLanguage(lng, this.options);
      });
    }
  };
  Browser.type = "languageDetector";

  // src/config/i18n.ts
  var resources = {
    pt: {
      errors: {
        required_field: "Campo obrigat\xF3rio",
        invalid_latitude: "A latitude deve ser menor ou igual a 90.0000000 e maior que -90.0000000",
        invalid_longitude: "A longitude deve ser menor ou igual 180.0000000 e maior ou igual a -180.0000000",
        login_expired: "Sess\xE3o Expirada",
        login_expired_msg: "Sua sess\xE3o expirou. Por favor, fa\xE7a login novamente.",
        authentication_needed: "Necess\xE1ria a autentica\xE7\xE3o",
        file_downloaded: "Erro ao baixar arquivo",
        file_deleted: "Erro ao excluir arquivo"
      },
      signin: {
        enter_with_your_account: "Entre com a sua conta",
        use_your_email: "Utilise seu e-mail e senha para entrar no sistema",
        forget_password: "Esqueci minha senha",
        signup: "Cadastre-se",
        check_use_policy: "Verifique aqui o nosso termo de uso e pol\xEDtica de privacidade",
        user_loggedin: "Seja bem vindo!",
        login_error: "Erro ao tentar efetuar login",
        recover_password_message: "Se o seu e-mail estiver correto e seu usu\xE1rio ainda estiver ativo, voc\xEA deve ter recebido um e-mail com as orienta\xE7\xF5es para altera\xE7\xE3o da sua senha.",
        password_recover_error: "Erro ao tentar recuperar senha",
        start_password_recover_msg: "Entre abaixo com o seu e-mail de cadastro para iniciar a recupera\xE7\xE3o de senha",
        back_to_signin_page: "Voltar \xE0 p\xE1gina inicial",
        start_password_change_msg: "Entre abaixo com sua nova senha e confirme-a para efetuar o processo de mudan\xE7a",
        new_password: "Nova senha",
        new_password_confirmation: "Confirmar nova senha",
        change_password: "Mudar senha",
        password_changed: "Sua senha foi alterada com sucesso! Tente agora realizar a sua autentica\xE7\xE3o",
        password_changed_error: "Ocorreu um erro ao tentar alterar a sua senha! Entre em contato com o administrador",
        password_reset_missing_fields: "Preencha a senha e confirme-a para continuar",
        password_dont_match: "A senha n\xE3o confere com a confirma\xE7\xE3o de senha. Por favor, tente novamente"
      },
      common: {
        email: "E-mail",
        password: "Senha",
        enter: "Entrar",
        orUCase: "OU",
        logout: "Sair",
        no_records_found: "Nenhum registro encontrado",
        new_record: "Novo registro",
        save_record: "Salvar",
        save_parameters: "Salvar par\xE2metros",
        actions: "A\xE7\xF5es",
        page: "P\xE1gina",
        showing: "Exibindo",
        de: "of",
        records: "registros",
        filter: "Filtrar",
        edit_record: "Editar registro",
        edit_record_description: "Altere os dados necess\xE1rios e clique em SALVAR para efetivar a mudan\xE7a",
        delete_record: "Excluir",
        delete_record_confirmation: "Deseja realmente excluir o registro?",
        delete_yesUCase: "SIM, EXCLU\xCDR",
        cancelUCase: "CANCELAR",
        saveUCase: "SALVAR",
        savingUCase: "SALVANDO",
        saving: "Salvando...",
        record_saved_successfuly: "Registro salvo com sucesso",
        record_edited_successfuly: "Registro editado com sucesso",
        record_deleted_successfuly: "Registro exclu\xEDdo com sucesso",
        record_saved_error: "Erro ao salvar o registro",
        record_edited_error: "Erro ao editar o registro",
        record_deleted_error: "Erro ao excluir o registro",
        unknown_error: "Erro desconhecido",
        website: "Website",
        required_field: "Campo obrigat\xF3rio",
        invalid_website: "Endere\xE7o de website inv\xE1lido",
        invalid_number: "N\xFAmero inv\xE1lido",
        selection: "Sele\xE7\xE3o",
        internal_code: "C\xF3digo interno",
        latitude: "Latitude",
        longitude: "Longitude",
        select_a_value: "Selecione um valor",
        file_downloaded: "Arquivo baixado com sucesso!",
        no_attachments: "N\xE3o h\xE1 arquivos anexados",
        scroll_to_top: "Ir ao topo",
        preview: "Pr\xE9-visualizar",
        download: "Baixar",
        preview_not_available: "Pr\xE9-visualiza\xE7\xE3o n\xE3o dispon\xEDvel",
        general_search: "Busca geral"
      },
      management: {
        management: "Gest\xE3o",
        companies: "Empresas",
        subsidiaries: "Filiais",
        users: "Usu\xE1rios",
        business_units: "Unidades de neg\xF3cio"
      },
      records: {
        records: "Registros",
        exporters: "Exportadores",
        service_types: "Categorias de servi\xE7o",
        services: "Servi\xE7os",
        products: "Produtos",
        inspection_locations: "Locais de inspe\xE7\xE3o",
        climates: "Climas",
        list_orders: "Listar ordens de servi\xE7o",
        new_service_order: "Nova ordem de servi\xE7o",
        reports: "Relat\xF3rios",
        parameters: "Par\xE2metros",
        regions: "Regi\xF5es",
        cities: "Cidades",
        traders: "Traders",
        shippers: "Armadores",
        weighing_types: "Tipos de pesagem",
        operation_types: "Tipos de opera\xE7\xE3o",
        packing_types: "Tipo de acondicionamento",
        sampling_types: "Tipos de amostragem",
        weighing_rules: "Regras de pesagem",
        vessel_types: "Tipos de navios",
        measures: "Unidades de medida",
        cargo_types: "Tipos de carga",
        weighing_ryles: "Regras de pesajgem",
        weight_types: "Tipos de pesagem",
        document_types: "Tipos de documentos",
        currencies: "Moedas",
        inspection_sites: "Pontos de inspe\xE7\xE3o"
      },
      inspection_sites: {
        inspection_sites: "Pontos de inspe\xE7\xE3o",
        list: "Lista de pontos de inspe\xE7\xE3o",
        name: "Nome",
        company: "Empresa",
        order: "Ordem"
      },
      clients: {
        clients: "Clientes",
        list: "Lista de clientes",
        name: "Nome do cliente",
        address: "Endere\xE7o",
        description: "Descri\xE7\xE3o"
      },
      companies: {
        companies: "Empresas",
        list: "Lista de empresas",
        name: "Nome",
        address: "Endere\xE7o",
        url_address: "P\xE1gina web",
        description: "Descri\xE7\xE3o",
        document: "CPF/CNPJ",
        document_no_special_characters: "Sem tra\xE7os ou pontos",
        document_is_required: "O CPF/CNPJ \xE9 obrigat\xF3rio.",
        enter_a_valid_document: "Digite um CPF ou CNPJ v\xE1lido."
      },
      subsidiaries: {
        subsidiaries: "Filiais",
        company: "Empresa",
        list: "Lista de filiais",
        name: "Nome",
        address: "Endere\xE7o",
        description: "Descri\xE7\xE3o",
        document: "CPF/CNPJ",
        document_no_special_characters: "Sem tra\xE7os ou pontos",
        document_is_required: "O CPF/CNPJ \xE9 obrigat\xF3rio.",
        enter_a_valid_document: "Digite um CPF ou CNPJ v\xE1lido."
      },
      exporters: {
        exporters: "Exportadores",
        list: "Lista de exportadores",
        name: "Nome do exportador",
        address: "Endere\xE7o",
        description: "Descri\xE7\xE3o"
      },
      service_types: {
        service_types: "Categorias de servi\xE7o",
        list: "Lista de categorias de servi\xE7o",
        name: "Nome da categoria",
        description: "Descri\xE7\xE3o",
        scope: "Escopo"
      },
      services: {
        service_types: "Servi\xE7os",
        service_type: "Categoria",
        list: "Lista de Servi\xE7os",
        name: "Nome do servi\xE7o",
        internal_code: "C\xF3digo interno",
        default_price: "Pre\xE7o padr\xE3o",
        description: "Descri\xE7\xE3o",
        scope: "Escopo"
      },
      sites: {
        sites: "Locais de inspe\xE7\xE3o",
        list: "Lista de locais de inspe\xE7\xE3o",
        name: "Nome",
        description: "Descri\xE7\xE3o",
        address: "Endere\xE7o"
      },
      weathers: {
        weathers: "Climas",
        list: "Lista de climas",
        name: "Nome"
      },
      traders: {
        traders: "Traders",
        list: "Lista de traders",
        name: "Nome"
      },
      shippers: {
        shippers: "Armadores",
        list: "Lista de armadores",
        name: "Nome"
      },
      products: {
        products: "Produtos",
        list: "Lista de produtos",
        name: "Nome",
        description: "Descri\xE7\xE3o"
      },
      service_order_status: {
        service_order_status: "Status referente \xE0s ordens de servi\xE7o",
        list: "Lista de status",
        name: "Nome",
        description: "Descri\xE7\xE3o",
        color: "Cor de identifica\xE7\xE3o",
        is_default: "\xC9 o status padr\xE3o?",
        is_canceled: "Representa cancelamento?",
        is_billable: "Representa faturamento?",
        is_operating: "Representa in\xEDcio de opera\xE7\xE3o?",
        enable_editing: "\xC9 permit\xEDvel edi\xE7\xE3o?",
        enable_attachment: "Permitido anexar arquivos?",
        comment_required: "Requer coment\xE1rio obrigat\xF3rio?",
        status_related: "Selecione os status para os quais o usu\xE1rio poder\xE1 mover",
        status_relatad_comment: "O usu\xE1rio poder\xE1 mover a Ordem de servi\xE7o para os seguintes status"
      },
      regions: {
        regions: "Regi\xF5es",
        list: "Lista de regi\xF5es",
        name: "Nome"
      },
      cities: {
        cities: "Cidades",
        list: "Lista de cidades",
        name: "Nome",
        region: "Regi\xE3o",
        no_regions_found: "Nenhuma regi\xE3o encontrada",
        select_a_region: "Selecione a regi\xE3o"
      },
      business_units: {
        business_units: "Unidades de neg\xF3cio",
        list: "Lista de unidades de neg\xF3cio",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      cargo_types: {
        cargo_types: "Tipos de carga",
        list: "Lista de tipos de carga",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      operation_types: {
        operation_types: "Tipos de opera\xE7\xE3o",
        list: "Lista de tipos de opera\xE7\xE3o",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      sampling_types: {
        operation_types: "Tipos de amostragem",
        list: "Lista de tipos de amostragem",
        name: "Nome",
        internal_code: "Internal code"
      },
      weight_types: {
        cargo_types: "Tipos de pesagem",
        list: "Lista de tipos de pesagem",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      weighing_rules: {
        weighing_rules: "Regras de pesajem",
        list: "Lista de regras de pesajem",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      measures: {
        measures: "Unidades de medida",
        list: "Lista de unidades de medida",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      packing_types: {
        packing_types: "Tipos de acondicionamento",
        list: "Lista de tipos de acondicionamento",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      document_types: {
        document_types: "Tipos de documentos",
        list: "Lista de tipos de documentos",
        name: "Nome",
        internal_code: "C\xF3digo interno",
        description: "Descri\xE7\xE3o"
      },
      vessel_types: {
        vessel_types: "Tipos de navios",
        list: "Lista de tipos de navios",
        name: "Nome",
        internal_code: "C\xF3digo interno"
      },
      currencies: {
        currencies: "Moedas",
        list: "List of document types",
        name: "Nome",
        internal_code: "C\xF3digo interno",
        currency_code: "Sigla da moeda"
      },
      service_orders: {
        service_order: "Ordem de servi\xE7o",
        service_orders: "Ordens de servi\xE7o",
        list: "Lista de ordens de servi\xE7o",
        title: "Lista de ordens de servi\xE7o",
        settings_title: "Lista de par\xE2metros dispon\xEDveis para as ordens de servi\xE7o",
        settings: "Par\xE2metros",
        field: "Campo",
        visible: "Vis\xEDvel",
        required: "Obrigat\xF3rio",
        fields: "Campos",
        reports: "Relat\xF3rios",
        service_to_be_performed: "Servi\xE7o a ser efetuado",
        save_parameters: "Salvar par\xE2metros",
        default_field_value: "Valor padr\xE3o do campo",
        service_type_required: "voc\xEA precisa escolher o tipo do servi\xE7o",
        assigned_inspectors: "Designa\xE7\xF5es e agendamentos",
        operation_data: "Dados da opera\xE7\xE3o",
        involved_costs: "Custos envolvidos",
        billing: "Faturamento",
        general_data: "Dados gerais da ordem de servi\xE7o",
        dates_sites_forecasts: "Datas, locais e previs\xF5es",
        weighing_sampling_details: "Dados referente a pesagem e amostragem",
        order_identifier: "N\xFAmero da OS",
        operation_type: "Tipo da opera\xE7\xE3o",
        ref_number: "N\xFAmero de refer\xEAncia interno",
        created_at: "Data de cria\xE7\xE3o",
        show_in_report: "Mostrar no relat\xF3rio",
        show_in_operation: "Mostrar ao operador",
        read_only_in_operation: "Operador n\xE3o edita",
        required_in_operation: "Obrigat\xF3rio para o operador",
        status: "Status"
      },
      new_service_order: {
        subsidiary: "Filial",
        client: "Cliente",
        exporter: "Exportador",
        product: "Produto",
        region: "Regi\xE3o",
        city: "Cidade",
        business_unit: "Unidade de neg\xF3cio",
        cargo_type: "Tipo de carga",
        trader: "Trader",
        shipper: "Armador",
        qtd_products: "Quantidade (produto)",
        operation_type: "Tipo de opera\xE7\xE3o",
        sampling_type: "Tipo de amostragem",
        inspection_site_1: "Primeiro local de inspe\xE7\xE3o",
        inspection_site_2: "Segundo local de inspe\xE7\xE3o",
        inspection_site_3: "Terceiro local de inspe\xE7\xE3o",
        inspection_stuffing_site: "Local de estufagem",
        weighing_rule: "Regra de pesagem",
        weight_type: "Tipo de pesagem",
        invoice_measure: "Unidade de medida da invoice",
        landing_measure: "Unidade de medida do desembarque",
        loss_gain_weight_difference: "Diferen\xE7a de ganho/perda liberada",
        max_weight_allowed: "Limite m\xE1ximo de peso permitido",
        max_weight_allowed_type: "Tipo de limite m\xE1ximo de peso permitido",
        tare_volume_landed: "Tara desembarcado",
        order_identifier: "N\xFAmero identificador da nomea\xE7\xE3o",
        ref_number: "N\xFAmero de refer\xEAncia interna",
        client_ref_number: "N\xFAmero de refer\xEAncia do cliente",
        invoice_number: "N\xFAmero da invoice",
        invoice_value: "Valor da invoice",
        client_invoice_number: "N\xFAmero da invoice do cliente",
        vessel_name: "Nome do navio",
        booking_number: "N\xFAmero do booking",
        contract_number: "N\xFAmero do contrato",
        harvest: "Safra",
        packing_type: "Tipo de acondicionamento",
        comments: "Coment\xE1rios",
        nomination_date: "Data da nomea\xE7\xE3o",
        operation_starts_at: "Prev. de in\xEDcio da opera\xE7\xE3o",
        bl_date: "Data do BL",
        cargo_arrival_date: "Data de chegada da carga",
        operation_finishes_at: "Prev. de t\xE9rmino da opera\xE7\xE3o",
        operation_finish_date: "Data de t\xE9rmino da opera\xE7\xE3o",
        departure_site: "Porto de embarque",
        destination: "Destino da carga",
        gross_weight_landed: "Peso bruto desembarcado",
        gross_volume_invoice: "Peso bruto na invoice",
        net_volume_invoice: "Peso l\xEDquido na invoice",
        tare_volume_invoice: "Tara da invoice",
        gross_volume_landed: "Peso bruto desembarcado",
        net_volume_landed: "Peso l\xEDquido desembarcado",
        services_to_be_performed: "Servi\xE7os a serem realizados",
        service: "Servi\xE7o",
        unit_price: "Pre\xE7o unit\xE1rio",
        quantity: "Quantidade",
        total_price: "Pre\xE7o total",
        add_new_service: "Adicionar",
        delete_new_service: "Excluir",
        add_new_attachment: "Anexar",
        preview_not_supported_local: "Pr\xE9-visualiza\xE7\xE3o n\xE3o dispon\xEDvel para arquivos Office locais. O arquivo ser\xE1 baixado.",
        payments_service_order: "Custos e pagamentos relacionados \xE0 ordem de servi\xE7o",
        schedules_service_order: "Designa\xE7\xF5es e agendamentos",
        payment_description: "Descri\xE7\xE3o do custo",
        payment_unit_price: "Custo unit\xE1rio",
        payment_quantity: "Quantidade",
        payment_total_price: "Custo total",
        delete_new_payment: "Excluir",
        document_type: "Documento fiscal",
        payment_document_number: "Identifica\xE7\xE3o do documento",
        currency: "Moeda",
        container_number: "Container",
        inspector_name: "Inspetor",
        inspection_date: "Data da inspe\xE7\xE3o",
        os_number: "N\xFAmero da OS",
        attachments: "Anexos",
        file_name: "Arquivo",
        file_type: "Tipo do arquivo",
        file_size: "Tamanho",
        file_downloaded: "Arquivo baixado com sucesso!",
        file_deleted: "Arquivo exclu\xEDdo com sucesso!",
        current_status: "Status atual",
        select_next_status: "Selecione o pr\xF3ximo status",
        change_status_modal_title: "Mudar o status da Ordem de servi\xE7o",
        change_status_modal_confirmation: "Deseja realmente mudar o status da ordem de servi\xE7o para",
        change_status_comments: "Coment\xE1rio sobre a mudan\xE7a de status",
        no_schedules: "Nenhum inspetor agendado",
        add_new_schedule: "Novo",
        delete_new_schedule: "Excluir",
        add_new_payment: "Adicionar",
        no_operations: "Nenhum registro efetuado at\xE9 o momento",
        operation_details: "Detalhes da opera\xE7\xE3o",
        collapse_all: "Fechar todos",
        expand_all: "Expandir todos",
        no_matching_operations: "Nenhuma opera\xE7\xE3o encontrada para a busca",
        match: "Encontrado"
      },
      goods_service_order: {
        vessel_type: "Tipo do navio",
        loading_port: "Porto de embarque",
        loading_facility: "Local de embarque",
        discharge_port: "Porto de desembarque",
        discharge_facility: "Local de desembarque",
        weather: "Clima",
        vessel_name: "Nome do navio",
        imo_number: "N\xFAmero IMO",
        call_sign: "N\xFAmero de chamada",
        mmsi_number: "N\xFAmero MMSI",
        port_of_registry: "Porto de registro",
        flag_state: "Pa\xEDs de bandeira",
        loa: "LOA",
        breadth: "Bredth",
        depth: "Depth",
        gross_tonnage: "Tonelagem bruta",
        net_tonnage: "Tonelagem l\xEDquida",
        owner: "Propriet\xE1rio",
        sold_to: "Vendido para",
        cargo: "Carga",
        description: "Descri\xE7\xE3o",
        weight_for_transportation: "Peso para transporte",
        dimension: "Dimens\xE3o",
        date_of_loading: "Data de embarque",
        date_of_discharge: "Data de desembarque",
        vessel_voyage: "Viagem do navio",
        flat_racks_and_position_on_board: "Flat racks e posi\xE7\xE3o a bordo",
        booking_bb: "Booking BB",
        inspector_name: "Nome do inspetor",
        terminal_supervisor_name: "Nome do supervisor do terminal",
        vessel_arrived: "Data de chegada do navio",
        vessel_berthed: "Data de atraca\xE7\xE3o do navio",
        operations_commenced: "Data de in\xEDcio das opera\xE7\xF5es",
        surveyor_at_terminal: "Data de chegada do inspetor ao terminal",
        surveyor_on_board: "Data de embarque do inspetor",
        unlashing: "Data de in\xEDcio do destombamento",
        lifting_1: "Data de in\xEDcio da primeira i\xE7ada",
        lifting_2: "Data de in\xEDcio da segunda i\xE7ada",
        lifting_3: "Data de in\xEDcio da terceira i\xE7ada",
        lifting_4: "Data de in\xEDcio da quarta i\xE7ada",
        lifting_5: "Data de in\xEDcio da quinta i\xE7ada",
        discharge_completed: "Data de conclus\xE3o do desembarque",
        final_inspection: "Data da inspe\xE7\xE3o final",
        surveyor_left_terminal: "Data de sa\xEDda do inspetor do terminal",
        delete_record_confirmation: "Deseja realmente excluir o registro?",
        search_vessel: "Buscar Navio",
        search_vessel_placeholder: "Digite o nome do navio..."
      },
      tally: {
        plate_number: "N\xFAmero da placa",
        site: "Local",
        ticket: "Ticket",
        tare_weight: "Peso de entrada (kg)",
        gross_weight: "Peso de sa\xEDda (kg)",
        net_weight: "Peso l\xEDquido (kg)",
        date: "Data e hora",
        latitude: "Latitude",
        longitude: "Longitude",
        delete_record_confirmation: "Deseja realmente excluir o registro?",
        search_plate: "Buscar placa",
        search_plate_placeholder: "Digite a placa..."
      },
      tallies_service_order: {
        search_plate: "Buscar placa",
        search_plate_placeholder: "Digite a placa...",
        plate_number: "N\xFAmero da placa",
        ticket: "N\xFAmero do ticket",
        first_site_inspection: "Primeiro local de inspe\xE7\xE3o",
        second_site_inspection: "Segundo local de inspe\xE7\xE3o"
      },
      users: {
        users: "Usu\xE1rios",
        company: "Empresa",
        subsidiary: "Filial",
        list: "Lista de usu\xE1rios",
        name: "Nome do usu\xE1rio",
        email: "E-mail",
        profile: "Perf\xEDl",
        no_companies_found: "Nenhuma empresa encontrada",
        select_a_company: "Selecione a emrpesa",
        no_profiles_found: "Nenhum perfil encontrado",
        select_a_profile: "Selecione o perfil",
        subsidiaries_assigned_to_user: "Filiais vinculadas ao usu\xE1rio",
        assign_subsidiaries_to_user: "Defina as filiais que o usu\xE1rio pode ter acesso",
        assign_subsidiaries: "Filiais vinculadas ao usu\xE1rio",
        assign_subsidiaries_comment: "Defina as filiais as quais o usu\xE1rio pode ter acesso"
      }
    },
    en: {
      tally: {
        plate_number: "Plate number",
        site: "Site",
        ticket: "Ticket",
        tare_weight: "Tare weight (kg)",
        gross_weight: "Gross weight (kg)",
        net_weight: "Net weight (kg)",
        date: "Date and Time",
        latitude: "Latitude",
        longitude: "Longitude",
        delete_record_confirmation: "Are you sure you want to delete the record?",
        search_plate: "Search plate",
        search_plate_placeholder: "Type the plate..."
      },
      errors: {
        required_field: "This field is required",
        invalid_latitude: "Latitude must be less than or equal to 90.0000000 and greater than -90.0000000",
        invalid_longitude: "Longitude must be less than or equal to 180.0000000 and greater than or equal to -180.0000000",
        login_expired: "Session expired",
        login_expired_msg: "Your session is expired. Please login again"
      },
      signin: {
        enter_with_your_account: "Signin with your account",
        use_your_email: "Enter your e-mail and password to singin",
        forget_password: "I forgot my password",
        signup: "Signup",
        check_use_policy: "Check our term of use and privacy policy",
        user_loggedin: "User successfully authenticated! We are redirecting you to the home page",
        login_error: "Error trying to log in",
        recover_password_message: "If your email is correct and your username is still active, you should have received an email with instructions on how to change your password.",
        password_recover_error: "Error trying to recover password",
        start_password_recover_msg: "Enter your registered email below to start password recovery.",
        back_to_signin_page: "Back to home page",
        start_password_change_msg: "Enter your new password below and confirm it to complete the change process.",
        new_password: "New password",
        new_password_confirmation: "Confirm your new passord",
        change_password: "Change password",
        password_changed: "You password was succesfully changed! Try loging in again",
        password_changed_error: "An error has occurred while trying to change your password. Please contact the system administrator",
        password_reset_missing_fields: "Fill in the password and confirm it to continue",
        password_dont_match: "Password does not match password confirmation. Please try again"
      },
      common: {
        email: "E-mail",
        password: "Password",
        enter: "Signin",
        orUCase: "OR",
        logout: "Logout",
        no_records_found: "No records found",
        new_record: "New record",
        save_record: "Save record",
        actions: "Actions",
        page: "Page",
        showing: "Showing",
        de: "of",
        records: "records",
        filter: "Filter",
        edit_record: "Edit record",
        edit_record_description: "Change the data you need and then click on SAVE",
        delete_record: "Delete record",
        delete_record_confirmation: "Are you sure you want to delete the record?",
        delete_yesUCase: "YES, DELETE",
        cancelUCase: "CANCEL",
        saveUCase: "SAVE",
        savingUCase: "SAVING",
        saving: "Saving...",
        record_saved_successfuly: "Record saved  successfully",
        record_edited_successfuly: "Record edited  successfully",
        record_deleted_successfuly: "Record deleted successfully",
        record_saved_error: "Error saving record",
        record_edited_error: "Error editing record",
        record_deleted_error: "Error deleting record",
        unknown_error: "Unknown error",
        website: "Website",
        required_field: "Required field",
        invalid_website: "Invalid website address",
        invalid_number: "Invalid number",
        selection: "Select",
        internal_code: "Internal code",
        latitude: "Latitude",
        longitude: "Longitude",
        select_a_value: "Select a value",
        file_downloaded: "Arquivo baixado com sucesso!",
        no_attachments: "N\xE3o h\xE1 arquivos anexados",
        scroll_to_top: "Scroll to top",
        preview: "Preview",
        download: "Download",
        preview_not_available: "Preview not available",
        general_search: "General search"
      },
      management: {
        management: "Management",
        companies: "Companies",
        subsidiaries: "Subsidiaries",
        users: "Users",
        business_units: "Business Units"
      },
      records: {
        records: "Records",
        clients: "Clients",
        exporters: "Exporters",
        services: "Services",
        service_types: "Service Categories",
        products: "Products",
        inspection_locations: "Inspection Locations",
        climates: "Climates",
        service_orders: "Service Orders",
        new_service_order: "New serice order",
        list_orders: "List Orders",
        reports: "Reports",
        parameters: "Parameters",
        regions: "Regions",
        cities: "Counties",
        traders: "Traders",
        shippers: "Shippers",
        weighing_types: "Weighing types",
        operation_types: "Operation types",
        packing_types: "Stuffing types",
        sampling_types: "Sampling types",
        measures: "Metric units",
        cargo_types: "Cargo Types",
        weighing_rules: "Weighing rules",
        vessel_types: "Vessel Types",
        weight_types: "Weight Types",
        document_types: "Document types",
        currencies: "Currencies",
        inspection_sites: "Inspection Sites"
      },
      inspection_sites: {
        inspection_sites: "Inspection Sites",
        list: "Inspection sites list",
        name: "Name",
        company: "Company",
        order: "Order"
      },
      clients: {
        clients: "Clients",
        list: "Lista of clients",
        name: "Client name",
        address: "Address",
        description: "Description"
      },
      companies: {
        companies: "Companies",
        list: "Companies list",
        name: "Name",
        address: "Address",
        url_address: "Webpage",
        description: "Description",
        document: "Document number",
        document_no_special_characters: "Only numbers",
        document_is_required: "The document number is required",
        enter_a_valid_document: "Enter a valid document number"
      },
      subsidiaries: {
        subsidiaries: "Subsidiaries",
        company: "Company",
        list: "Subsidiaries list",
        name: "Name",
        address: "Address",
        description: "Description",
        document: "Document number",
        document_no_special_characters: "Only numbers",
        document_is_required: "Document number is required",
        enter_a_valid_document: "Enter a valid document number"
      },
      exporters: {
        exporters: "Exporters",
        list: "Exporters list",
        name: "Exporter name",
        address: "Address",
        description: "Description"
      },
      service_types: {
        service_types: "Services type",
        list: "Services type list",
        name: "Service name",
        description: "Description",
        scope: "Scope"
      },
      services: {
        service_types: "Servi\xE7os",
        service_type: "Category",
        list: "Lista de Servi\xE7os",
        name: "Nome do servi\xE7o",
        internal_code: "Internal code",
        default_price: "Default price",
        description: "Descri\xE7\xE3o",
        scope: "Escopo"
      },
      sites: {
        sites: "Inspection sites",
        list: "List of inspection sites",
        name: "Name",
        description: "Description",
        address: "Address"
      },
      weathers: {
        weathers: "Weather",
        list: "List of weather",
        name: "Name"
      },
      traders: {
        traders: "Traders",
        list: "List if traders",
        name: "Name"
      },
      shippers: {
        shippers: "Shippers",
        list: "List of shippers",
        name: "Name"
      },
      products: {
        weathers: "Products",
        list: "List of products",
        name: "Name",
        description: "Description"
      },
      service_order_status: {
        service_order_status: "Status of services orders",
        list: "Lista de status",
        name: "Name",
        description: "Description",
        color: "Identification color",
        is_default: "Is the default status?",
        is_canceled: "Represents cancellation?",
        is_billable: "Represents billing?",
        is_operating: "Representa start of operation?",
        enable_editing: "Allow editing?",
        comment_required: "Requires comment?",
        enable_attachment: "Enable attachment?",
        status_related: "Select which status the user will be able to move to",
        status_relatad_comment: "The user will be able to move the Service order to the following statuses"
      },
      regions: {
        regions: "Regions",
        list: "List of regions",
        name: "Name"
      },
      cities: {
        cities: "Counties",
        list: "List of counties",
        name: "Name",
        region: "Region",
        no_regions_found: "No regions found",
        select_a_region: "Please select a region"
      },
      business_units: {
        business_units: "Business Units",
        list: "List of business units",
        name: "Name",
        internal_code: "Internal code"
      },
      cargo_types: {
        cargo_types: "Cargo Types",
        list: "List of cargo types",
        name: "Name",
        internal_code: "C\xF3digo interno"
      },
      operation_types: {
        operation_types: "Operation types",
        list: "List of operation types",
        name: "Name",
        internal_code: "Internal code"
      },
      sampling_types: {
        operation_types: "Sampling types",
        list: "List of sampling types",
        name: "Name",
        internal_code: "Internal code"
      },
      weight_types: {
        cargo_types: "Weighing types",
        list: "List of weighing types",
        name: "Name",
        internal_code: "Internal code"
      },
      weighing_rules: {
        cargo_types: "Weighing rules",
        list: "List of weighing rules",
        name: "Name",
        internal_code: "Internal code"
      },
      measures: {
        measures: "Metric units",
        list: "List of weighing rules",
        name: "Name",
        internal_code: "Internal code"
      },
      packing_types: {
        packing_types: "Storage types",
        list: "List of storage types",
        name: "Name",
        internal_code: "Internal code"
      },
      document_types: {
        document_types: "Document types",
        list: "List of document types",
        name: "Nome",
        internal_code: "C\xF3digo interno",
        description: "Description"
      },
      vessel_types: {
        vessel_types: "Vessel types",
        list: "List of vessel types",
        name: "Name",
        internal_code: "Internal Code"
      },
      currencies: {
        currencies: "Currencies",
        list: "List of currencies",
        name: "Name",
        internal_code: "Internal code",
        currency_code: "Currency identifier"
      },
      service_orders: {
        service_order: "Service Order",
        service_orders: "Service Orders",
        title: "Lista of service orders",
        settings_title: "List of parameters available for service orders",
        settings: "Settings",
        field: "Field",
        visible: "Visible",
        required: "Mandatory",
        fields: "Fields",
        reports: "Reports",
        service_to_be_performed: "Services to be performed",
        save_parameters: "Save parameters",
        default_field_value: "Default field value",
        service_type_required: "You have to select the service type",
        assigned_inspectors: "Assignments and Schedule",
        payment_unit_price: "Custo unit\xE1rio",
        involved_costs: "Costs involved",
        billing: "Billing",
        general_data: "Service order details",
        dates_sites_forecasts: "Dates, sites and forecasts",
        weighing_sampling_details: "Weighing and sampling details",
        show_in_report: "Show in the report",
        show_in_operation: "Show to the operator",
        read_only_in_operation: "Operator don't edit",
        required_in_operation: "Mandatory for the operator",
        status: "Status"
      },
      parameters: {
        title: "List of available parameters for service orders",
        field: "Field",
        visible: "Visible?",
        required: "Required?",
        cliente: "Client",
        exportador: "Exporter"
      },
      users: {
        users: "Users",
        company: "Company",
        subsidiary: "Subsidiary",
        list: "Users list",
        name: "User name",
        email: "E-mail",
        profile: "Profile",
        no_companies_found: "No company found",
        select_a_company: "Select the company",
        no_profiles_found: "No profile found",
        select_a_profile: "Select the profile",
        subsidiaries_assigned_to_user: "Subsidiaries assigned to the user",
        assign_subsidiaries_to_user: "Define the subsidiaries that the user can access",
        assign_subsidiaries: "Branches assinged to the user",
        assign_subsidiaries_comment: "Define which branches the user will have access"
      }
    },
    es: {
      tally: {
        plate_number: "Matr\xEDcula",
        site: "Local",
        ticket: "Ticket",
        tare_weight: "Peso tara (kg)",
        gross_weight: "Peso bruto (kg)",
        net_weight: "Peso neto (kg)",
        date: "Fecha y hora",
        latitude: "Latitud",
        longitude: "Longitud",
        delete_record_confirmation: "\xBFDesea eliminar el registro?",
        search_plate: "Buscar matr\xEDcula",
        search_plate_placeholder: "Escriba la matr\xEDcula..."
      },
      errors: {
        required_field: "Este campo es requerido",
        invalid_latitude: "La latitud debe ser menor o igual a 90.0000000 y mayor que -90.0000000",
        invalid_longitude: "La longitud debe ser menor o igual a 180.0000000 y mayor o igual a -180.0000000",
        login_expired: "la ses\xEDon expir\xF3",
        login_expired_msg: "Tu sesi\xF3n ha expirado. Vuelve a iniciar su sesi\xF3n."
      },
      signin: {
        enter_with_your_account: "Entre com a su cuenta",
        use_your_email: "Use su correo y clave para ingresar al sistema",
        forget_password: "Olvid\xE9 mi clave",
        signup: "Inscribirse",
        check_use_policy: "Consulta aqu\xED nuestros t\xE9rminos de uso y pol\xEDtica de privacidad",
        user_loggedin: "\xA1Usuario autenticado correctamente! Le estamos redirigiendo a la p\xE1gina de inicio.",
        login_error: "Error al intentar iniciar sesi\xF3n",
        recover_password_message: "If your email is correct and your username is still active, you should have received an email with instructions on how to change your password.",
        password_recover_error: "Error al intentar recuperar la contrase\xF1a",
        start_password_recover_msg: "Ingrese su correo electr\xF3nico registrado a continuaci\xF3n para iniciar la recuperaci\xF3n de contrase\xF1a.",
        back_to_signin_page: "Regresar a la p\xE1gina de inicio",
        start_password_change_msg: "Ingrese su nueva contrase\xF1a y conf\xEDrmela para completar el proceso de cambio.",
        new_password: "Nueva contrase\xF1a",
        new_password_confirmation: "Confirme su nueva contrase\xF1a",
        change_password: "Cambiar contrase\xF1a",
        password_changed: "Su contrase\xF1a fue renovada con \xE9xito! Intente ahora realizar sua ingreso al sistema",
        password_changed_error: "Se produjo un error al intentar cambiar su contrase\xF1a. Por favor, contacte con el administrador del sistema.",
        password_reset_missing_fields: "Complete la contrase\xF1a y conf\xEDrmela para continuar",
        password_dont_match: "La contrase\xF1a no coincide con la confirmaci\xF3n de contrase\xF1a. Intente otra vez"
      },
      common: {
        email: "E-mail",
        password: "Clave",
        enter: "Ingresar",
        orUCase: "O",
        logout: "Salir",
        no_records_found: "No hay registros",
        new_record: "Agregar",
        save_record: "Guardar",
        actions: "Acciones",
        page: "P\xE1gina",
        showing: "Mostrando",
        de: "de",
        records: "registros",
        filter: "Filtrar",
        edit_record: "Editar registro",
        edit_record_description: "Cambie los datos neces\xE1rios y entonc\xE9s haz un click en SALVAR",
        delete_record: "Eliminar registro",
        delete_record_confirmation: "Deseas realmente eliminar el reg\xEDstro?",
        delete_yesUCase: "S\xCD, ELIMINAR",
        cancelUCase: "CANCELAR",
        saveUCase: "REGISTRAR",
        savingUCase: "REGISTRANDO",
        record_saved_successfuly: "Registro salvo con \xE9xito",
        record_edited_successfuly: "Registro editado con \xE9xito",
        record_deleted_successfuly: "Registro eliminado con \xE9xito",
        record_saved_error: "\xA1Error al guardar el registro",
        record_edited_error: "\xA1Error al editar el registro",
        record_deleted_error: "\xA1Error al eliminar el registro",
        unknown_error: "Error desconocido",
        website: "Website",
        required_field: "Campo requerido",
        invalid_website: "Enlace de website inv\xE1lido",
        invalid_number: "N\xFAmero inv\xE1lido",
        selection: "Seleccione",
        internal_code: "C\xF3digo interno",
        latitude: "Latitud",
        longitude: "Longitud",
        select_a_value: "Seleccione una opci\xF3n",
        file_downloaded: "Archivo bajado con \xE9xito!",
        no_attachments: "NNo hay archivos adjuntos",
        scroll_to_top: "Ir arriba",
        preview: "Vista previa",
        download: "Descargar",
        preview_not_available: "Vista previa no disponible",
        general_search: "B\xFAsqueda general"
      },
      management: {
        management: "Gesti\xF3n",
        companies: "Empresas",
        subsidiaries: "Sucursales",
        users: "Usu\xE1rios",
        business_units: "Unidades de neg\xF3cio"
      },
      records: {
        records: "Registros",
        clients: "Clientes",
        exporters: "Exportadores",
        services: "Servicios",
        service_types: "Categorias de servicio",
        products: "Productos",
        inspection_locations: "Lugares de inspecci\xF3n",
        climates: "Climas",
        service_orders: "\xD3rdenes de servicio",
        new_service_order: "Nueva orden de servicio",
        list_orders: "Listar \xF3rdenes",
        reports: "Informes",
        parameters: "Par\xE1metros",
        regions: "Regiones",
        cities: "Ciudades",
        traders: "Traders",
        shippers: "Armadores",
        weighing_types: "Tipos de pesaje",
        operation_types: "Tipos de operaci\xF5n",
        packing_types: "Tipos de estufaje",
        sampling_types: "Tipos de muestreo",
        measures: "Unidades m\xE9tricas",
        cargo_types: "Tipos de carga",
        weighing_rules: "Reglas de pesaje",
        vessel_types: "Tipos de barcos",
        weight_types: "Tipos de peso",
        document_types: "Tipos de documentos",
        currencies: "Monedas",
        inspection_sites: "Pontos de inspe\xE7\xE3o"
      },
      inspection_sites: {
        inspection_sites: "Pontos de inspe\xE7\xE3o",
        list: "Lista de pontos de inspe\xE7\xE3o",
        name: "Nome",
        company: "Empresa",
        order: "Ordem"
      },
      clients: {
        clients: "Clientes",
        list: "Listado de clientes",
        name: "Nombre del cliente",
        address: "Direcci\xF3n",
        description: "Descripci\xF3n"
      },
      companies: {
        companies: "Empresas",
        list: "Listado de empresas",
        name: "Nombre",
        address: "Direcc\xEDon",
        url_address: "Sitio web",
        description: "Description",
        document: "N\xFAmero del documento",
        document_no_special_characters: "Apenas n\xFAmeros",
        document_is_required: "El n\xFAmero del documento es obligt\xF3rio",
        enter_a_valid_document: "Informe um n\xFAmero v\xE1lido de documento"
      },
      subsidiaries: {
        subsidiaries: "Sucursales",
        company: "Empresa",
        list: "Listado de sucursales",
        name: "Nombre",
        address: "Direcci\xF3n",
        description: "Descripci\xF3n",
        document: "N\xFAmero del documento",
        document_no_special_characters: "Apenas n\xFAmeros",
        document_is_required: "Este campo es requerido",
        enter_a_valid_document: "Introduzca um documento v\xE1lido"
      },
      exporters: {
        exporters: "Exportadores",
        list: "Listado de exportadores",
        name: "Nombre del exportador",
        address: "Direcci\xF3n",
        description: "Descripci\xF3n"
      },
      service_types: {
        service_types: "Tipos de servicio",
        list: "Listado de tipos de servicio",
        name: "Nombre del servicio",
        description: "Descripci\xF3n",
        scope: "Alcance"
      },
      services: {
        service_types: "Servicios",
        service_type: "Categoria",
        list: "Lista de Servicios",
        name: "Nombre del servi\xE7o",
        default_price: "Precio est\xE1ndar",
        internal_code: "C\xF3digo interno",
        description: "Descripci\xF3n",
        scope: "Alcance"
      },
      sites: {
        sites: "Sitios de inspecci\xF3n",
        list: "Listado de sitios de inspecci\xF3n",
        name: "Nombre",
        description: "Description",
        address: "Direcci\xF3n"
      },
      weathers: {
        weathers: "Climas",
        list: "Listado de climas",
        name: "Nombre"
      },
      traders: {
        traders: "Traders",
        list: "Lista de traders",
        name: "Nombre"
      },
      shippers: {
        shippers: "Armadores",
        list: "Lista de armadores",
        name: "Nombre"
      },
      products: {
        weathers: "Productos",
        list: "Listado de productos",
        name: "Nombre",
        description: "Descripci\xF3n"
      },
      service_order_status: {
        service_order_status: "Status de las ordenes de servicio",
        list: "Listado de status",
        name: "Nombre",
        description: "Descripci\xF3n",
        color: "Color de identificaci\xF3n",
        is_default: "Es el primer status?",
        is_canceled: "Representa rechazo?",
        is_billable: "Representa facturaci\xF3n?",
        is_operating: "Representa in\xEDcio de la operaci\xF3n?",
        enable_editing: "Se permite edici\xF3n",
        enable_attachment: "Se permite ajuntar archivos",
        comment_required: "Requer coment\xE1rio?",
        status_related: "Elija los status para los cuales el usuario podr\xE1 mover el orden de servicio",
        status_relatad_comment: "El usuario podr\xE1 mover el orden de servicie para los siguientes estados"
      },
      regions: {
        regions: "Regiones",
        list: "Listado de regiones",
        name: "Nombre"
      },
      cities: {
        cities: "Ciudades",
        list: "Listado de ciudades",
        name: "Nombre",
        region: "Regi\xF3n",
        no_regions_found: "Ninguna regi\xF3n encontrada",
        select_a_region: "Seleccione una regi\xF3n"
      },
      business_units: {
        business_units: "Unidades de negocio",
        list: "Lista de unidades de negocio",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      cargo_types: {
        cargo_types: "Tipos de carga",
        list: "Lista de tipos de carga",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      operation_types: {
        operation_types: "Tipos de operaci\xF3n",
        list: "Lista de tipos de operaci\xF3n",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      sampling_types: {
        operation_types: "Tipos de muestreo",
        list: "Lista de tipos de muestreo",
        name: "Nombre",
        internal_code: "Internal code"
      },
      weight_types: {
        cargo_types: "Tipos de pesaje",
        list: "Lista de tipos de pesaje",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      weighing_rules: {
        cargo_types: "Reglas de pesaje",
        list: "Lista de reglas de pesaje",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      measures: {
        measures: "Unidades m\xE9tricas",
        list: "Lista de unidades m\xE9tricas",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      packing_types: {
        packing_types: "Tipos de almacenamiento",
        list: "Lista de tipos de almacenamiento",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      document_types: {
        document_types: "Tipos de documentos",
        list: "Lista de tipos de documentos",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      vessel_types: {
        vessel_types: "Tipos de barcos",
        list: "Lista de tipos de barcos",
        name: "Nombre",
        internal_code: "C\xF3digo interno"
      },
      currencies: {
        currencies: "Monedas",
        list: "Lista de monedas",
        name: "Nombe",
        internal_code: "C\xF3digo interno",
        currency_code: "Acr\xF3nimo de la moneda"
      },
      service_orders: {
        service_order: "Nominaci\xF3n de servicio",
        service_orders: "Nominaciones de servicio",
        title: "Listado de nominaciones de servicio",
        settings_title: "Listado de par\xE1metros disponibles para \xF3rdenes de servicio",
        settings: "Par\xE1metros",
        field: "Campo",
        visible: "Visible",
        required: "Requerido",
        fields: "Campos",
        reports: "Informes",
        service_to_be_performed: "Servicios a serem realizados",
        save_parameters: "Guardar par\xE1metros",
        default_field_value: "Valor predeterminado del campo",
        service_type_required: "Debes seleccionar el servicio",
        assigned_inspectors: "Tareas, equipos y hor\xE1rios",
        involved_costs: "Costos involucrados",
        billing: "Facturaci\xF3n",
        general_data: "Detalles del orden de servicio",
        dates_sites_forecasts: "Fechas, lugares y previsiones",
        weighing_sampling_details: "Detalles del pesaje y muestreo",
        show_in_report: "Mostrar en el informe",
        show_in_operation: "Mostrar al operador",
        read_only_in_operation: "Operador no edita",
        required_in_operation: "Obligatorio para el operador",
        status: "Status"
      },
      parameters: {
        title: "Lista de par\xE1metros disponibles para las \xF3rdenes de servicio",
        field: "Campo",
        visible: "\xBFVisible?",
        required: "\xBFRequerido?",
        cliente: "Cliente",
        exportador: "Exportador"
      },
      users: {
        users: "Usuarios",
        company: "Empresa",
        subsidiary: "Sucursal",
        list: "Listado de sucursales",
        name: "Nombre del usuario",
        email: "E-mail",
        profile: "Perfil",
        no_companies_found: "Ninguna empresa encontrada",
        select_a_company: "Seleccione la emrpesa",
        no_profiles_found: "Ningun perfil encontrado",
        select_a_profile: "Seleccione el perfil",
        subsidiaries_assigned_to_user: "Sucursales vinculadas al usu\xE1rio",
        assign_subsidiaries_to_user: "Define las sucursales a las cuales el usuario puede acceder",
        assign_subsidiaries: "Sucursales vinculadas al usuario:",
        assign_subsidiaries_comment: "Elija las sucursales las cuales el usuario tendr\xE1 acceso"
      }
    }
  };
  instance.use(Browser).use(initReactI18next).init({
    resources,
    fallbackLng: "pt",
    ns: ["common", "management", "services", "parameters"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    }
  });
  var i18n_default = instance;
})();
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
