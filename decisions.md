# Decisions

## Removing `required` property attribute and existence check operators

Date: 28th of May 2024

**Defined Actions:**

- removing `required` attribute from evaluation context properties
- removing `isPresent` and `notIsPresent` operators
- evaluation logic definitions:
  - if the referenced property of a property condition is undefined or null, evaluate to false
  - if the value of referenced property of a property condition does not match the data type defined in the property, evaluate to false 

**Explanation:**

The idea was to define in the spec, which evaluation context properties
are required for the evaluation phase and which not.

Additionally, all property conditions had the operators `isPresent` and `notIsPresent`
which were only shown for properties, that had `required = false`.

The reason to remove the `required` attribute and the corresponding operators is **simplicity**
and the fact, that having this system does not bring any real benefits.

Why? The following three questions have to be asked:
- When would we validate the existence of `required = true` properties?
- What shall we do when `required = true` attributes are not present?
- What happens, if an optional property is referenced in a condition and there is no predecessor condition using the operator `isPresent`?

Do we want to throw an error? Or do we want to let the targeting algorithm evaluate a condition simply to `false`?

Throwing an error would be very dangerous, as this could break the application's business logic/execution.
Letting the evaluation of a condition return `false` to a missing property feels way more intuitive.

Plus, during the evaluation runtime, we also have to check, that the actual value of the property
is the same as the one denoted in the spec. What do we do, if that is not the case?

The simplest answer is: If a property is not present or has the wrong data type, we simply let targeting
rules/conditions evaluate to false.

This is very simple and easy to understand.

If we do it differently and keep the `required` attribute and the corresponding operators, we would have
to introduce way more semantic validation, which could easily become cognitive overload for
users managing a spec via the UI.
- An optional property should first be checked via an `isPresent` operator.
- This has to be done for conditions present in segments too. But where is the `isPresent` condition check required? In the segment itself or in a feature flag rule?
- Developers would need to catch these errors and implement a custom error handling logic. And in most cases they probably want to say "Return fallback/default value".

This is too much complexity and does not really bring any benefits.

_We simply want to a property condition evaluation to return false._
