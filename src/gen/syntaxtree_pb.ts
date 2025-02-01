// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file syntaxtree.proto (package syntaxtree, syntax proto3)

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file syntaxtree.proto.
 */
export const file_syntaxtree: GenFile = /*@__PURE__*/
  fileDesc("ChBzeW50YXh0cmVlLnByb3RvEgpzeW50YXh0cmVlIiAKEFNvbHV0aW9uTG9jYXRpb24SDAoEcGF0aBgBIAEoCSJgChVSb3NseW5Tb2x1dGlvbk1lc3NhZ2USDAoEbmFtZRgCIAEoCRI5Cg9yb3NseW5fcHJvamVjdHMYAyADKAsyIC5zeW50YXh0cmVlLlJvc2x5blByb2plY3RNZXNzYWdlImMKFFJvc2x5blByb2plY3RNZXNzYWdlEgwKBG5hbWUYBCABKAkSPQoRcm9zbHluX25hbWVzcGFjZXMYBSADKAsyIi5zeW50YXh0cmVlLlJvc2x5bk5hbWVzcGFjZU1lc3NhZ2Ui0gEKFlJvc2x5bk5hbWVzcGFjZU1lc3NhZ2USDAoEbmFtZRgGIAEoCRI9ChFyb3NseW5faW50ZXJmYWNlcxgHIAMoCzIiLnN5bnRheHRyZWUuUm9zbHluSW50ZXJmYWNlTWVzc2FnZRI2Cg5yb3NseW5fY2xhc3NlcxgIIAMoCzIeLnN5bnRheHRyZWUuUm9zbHluQ2xhc3NNZXNzYWdlEjMKDHJvc2x5bl9lbnVtcxgJIAMoCzIdLnN5bnRheHRyZWUuUm9zbHluRW51bU1lc3NhZ2UiNwoWUm9zbHluSW50ZXJmYWNlTWVzc2FnZRIMCgRuYW1lGAogASgJEg8KB21ldGhvZHMYCyADKAkinAEKElJvc2x5bkNsYXNzTWVzc2FnZRIMCgRuYW1lGAwgASgJEhQKDGNvbnN0cnVjdG9ycxgNIAMoCRIPCgdtZXRob2RzGA4gAygJEhIKCnByb3BlcnRpZXMYDyADKAkSDgoGZmllbGRzGBAgAygJEhQKDGJhc2VfY2xhc3NlcxgRIAMoCRIXCg9iYXNlX2ludGVyZmFjZXMYEiADKAkiMgoRUm9zbHluRW51bU1lc3NhZ2USDAoEbmFtZRgTIAEoCRIPCgdvcHRpb25zGBQgAygJMlwKEFJvc2x5blN5bnRheFRyZWUSSAoFUGFyc2USHC5zeW50YXh0cmVlLlNvbHV0aW9uTG9jYXRpb24aIS5zeW50YXh0cmVlLlJvc2x5blNvbHV0aW9uTWVzc2FnZUIZqgIWQ3NoYXJwQ2xhc3NWaWV3LlByb3Rvc2IGcHJvdG8z");

/**
 * @generated from message syntaxtree.SolutionLocation
 */
export type SolutionLocation = Message<"syntaxtree.SolutionLocation"> & {
  /**
   * @generated from field: string path = 1;
   */
  path: string;
};

/**
 * Describes the message syntaxtree.SolutionLocation.
 * Use `create(SolutionLocationSchema)` to create a new message.
 */
export const SolutionLocationSchema: GenMessage<SolutionLocation> = /*@__PURE__*/
  messageDesc(file_syntaxtree, 0);

/**
 * @generated from message syntaxtree.RoslynSolutionMessage
 */
export type RoslynSolutionMessage = Message<"syntaxtree.RoslynSolutionMessage"> & {
  /**
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * @generated from field: repeated syntaxtree.RoslynProjectMessage roslyn_projects = 3;
   */
  roslynProjects: RoslynProjectMessage[];
};

/**
 * Describes the message syntaxtree.RoslynSolutionMessage.
 * Use `create(RoslynSolutionMessageSchema)` to create a new message.
 */
export const RoslynSolutionMessageSchema: GenMessage<RoslynSolutionMessage> = /*@__PURE__*/
  messageDesc(file_syntaxtree, 1);

/**
 * @generated from message syntaxtree.RoslynProjectMessage
 */
export type RoslynProjectMessage = Message<"syntaxtree.RoslynProjectMessage"> & {
  /**
   * @generated from field: string name = 4;
   */
  name: string;

  /**
   * @generated from field: repeated syntaxtree.RoslynNamespaceMessage roslyn_namespaces = 5;
   */
  roslynNamespaces: RoslynNamespaceMessage[];
};

/**
 * Describes the message syntaxtree.RoslynProjectMessage.
 * Use `create(RoslynProjectMessageSchema)` to create a new message.
 */
export const RoslynProjectMessageSchema: GenMessage<RoslynProjectMessage> = /*@__PURE__*/
  messageDesc(file_syntaxtree, 2);

/**
 * @generated from message syntaxtree.RoslynNamespaceMessage
 */
export type RoslynNamespaceMessage = Message<"syntaxtree.RoslynNamespaceMessage"> & {
  /**
   * @generated from field: string name = 6;
   */
  name: string;

  /**
   * @generated from field: repeated syntaxtree.RoslynInterfaceMessage roslyn_interfaces = 7;
   */
  roslynInterfaces: RoslynInterfaceMessage[];

  /**
   * @generated from field: repeated syntaxtree.RoslynClassMessage roslyn_classes = 8;
   */
  roslynClasses: RoslynClassMessage[];

  /**
   * @generated from field: repeated syntaxtree.RoslynEnumMessage roslyn_enums = 9;
   */
  roslynEnums: RoslynEnumMessage[];
};

/**
 * Describes the message syntaxtree.RoslynNamespaceMessage.
 * Use `create(RoslynNamespaceMessageSchema)` to create a new message.
 */
export const RoslynNamespaceMessageSchema: GenMessage<RoslynNamespaceMessage> = /*@__PURE__*/
  messageDesc(file_syntaxtree, 3);

/**
 * @generated from message syntaxtree.RoslynInterfaceMessage
 */
export type RoslynInterfaceMessage = Message<"syntaxtree.RoslynInterfaceMessage"> & {
  /**
   * @generated from field: string name = 10;
   */
  name: string;

  /**
   * @generated from field: repeated string methods = 11;
   */
  methods: string[];
};

/**
 * Describes the message syntaxtree.RoslynInterfaceMessage.
 * Use `create(RoslynInterfaceMessageSchema)` to create a new message.
 */
export const RoslynInterfaceMessageSchema: GenMessage<RoslynInterfaceMessage> = /*@__PURE__*/
  messageDesc(file_syntaxtree, 4);

/**
 * @generated from message syntaxtree.RoslynClassMessage
 */
export type RoslynClassMessage = Message<"syntaxtree.RoslynClassMessage"> & {
  /**
   * @generated from field: string name = 12;
   */
  name: string;

  /**
   * @generated from field: repeated string constructors = 13;
   */
  constructors: string[];

  /**
   * @generated from field: repeated string methods = 14;
   */
  methods: string[];

  /**
   * @generated from field: repeated string properties = 15;
   */
  properties: string[];

  /**
   * @generated from field: repeated string fields = 16;
   */
  fields: string[];

  /**
   * @generated from field: repeated string base_classes = 17;
   */
  baseClasses: string[];

  /**
   * @generated from field: repeated string base_interfaces = 18;
   */
  baseInterfaces: string[];
};

/**
 * Describes the message syntaxtree.RoslynClassMessage.
 * Use `create(RoslynClassMessageSchema)` to create a new message.
 */
export const RoslynClassMessageSchema: GenMessage<RoslynClassMessage> = /*@__PURE__*/
  messageDesc(file_syntaxtree, 5);

/**
 * @generated from message syntaxtree.RoslynEnumMessage
 */
export type RoslynEnumMessage = Message<"syntaxtree.RoslynEnumMessage"> & {
  /**
   * @generated from field: string name = 19;
   */
  name: string;

  /**
   * @generated from field: repeated string options = 20;
   */
  options: string[];
};

/**
 * Describes the message syntaxtree.RoslynEnumMessage.
 * Use `create(RoslynEnumMessageSchema)` to create a new message.
 */
export const RoslynEnumMessageSchema: GenMessage<RoslynEnumMessage> = /*@__PURE__*/
  messageDesc(file_syntaxtree, 6);

/**
 * @generated from service syntaxtree.RoslynSyntaxTree
 */
export const RoslynSyntaxTree: GenService<{
  /**
   * @generated from rpc syntaxtree.RoslynSyntaxTree.Parse
   */
  parse: {
    methodKind: "unary";
    input: typeof SolutionLocationSchema;
    output: typeof RoslynSolutionMessageSchema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_syntaxtree, 0);

