# Ability System Guide

## Purpose

This file is a short operational guide for card design.

The canonical technical contract now lives in:

- [docs/ability-engine-contract.md](/C:/Users/lucas/OneDrive/Documentos/Github%20Repo/Southpaw/docs/ability-engine-contract.md)

## Summary

Southpaw abilities must follow these rules:

- they resolve on the active player's turn
- they must fit a supported target mode
- they should be composed from reusable primitives
- they must not depend on hidden deck, hand, trap, or interrupt systems
- persistence must be explicit on card state

## Safe Design Direction

Today, the best abilities are built from combinations of:

- damage
- heal
- elixir gain or drain
- position control
- temporary or permanent stat change
- destruction
- clone creation
- battlefield-wide effects with clear scope

## Unsafe Design Direction

Avoid designing around:

- reactions during the opponent turn
- delayed listeners like "the next time this happens"
- hidden draw or search systems
- replacement effects not modeled in the engine

## Maintenance Rule

If a new card needs a new mechanic, prefer adding one reusable primitive to the engine contract instead of one isolated hardcoded branch for that card only.
