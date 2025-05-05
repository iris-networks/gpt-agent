/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @abstract
 * @class BaseGUIAgent
 * @classdesc Abstract base class for GUI Agents.
 */
export abstract class BaseGUIAgent<
  TConfig = Record<string, never>,
  TRunParams = unknown,
  TRunOutput = unknown,
> {
  constructor(protected config: TConfig) {
    this.config = config;
  }
  /**
   * @abstract
   * @method run
   * @description Abstract method to run the GUI Agent with an instruction.
   */
  abstract run(instruction: TRunParams): Promise<TRunOutput>;
}

/**
 * @abstract
 * @class BaseModel
 * @classdesc Abstract base class for Models.
 * @template T - Generic type for model configurations.
 */
export abstract class BaseModel<TParams = unknown, TOutput = unknown> {
  abstract invoke(params: TParams): Promise<TOutput>;
}

/**
 * @abstract
 * @class BaseOperator
 * @classdesc Abstract base class for Operators.
 */
export abstract class BaseOperator {
  abstract screenshot(params?: unknown): Promise<unknown>;
  abstract execute(params: unknown): Promise<unknown>;
}
