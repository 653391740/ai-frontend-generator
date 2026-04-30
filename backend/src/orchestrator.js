import requirementAgent from './agents/requirementAgent.js';
import structureAgent from './agents/structureAgent.js';
import componentAgent from './agents/componentAgent.js';
import codeAgent from './agents/codeAgent.js';
import validationAgent from './agents/validationAgent.js';

/**
 * Run the full multi-agent pipeline.
 *
 * @param {string} userInput - Natural language description from the user.
 * @param {(event: { agent: string, status: string, data?: any, progress: number }) => void} onProgress
 * @returns {Promise<{ files: Array<{ name: string, content: string, language: string }>, validation: object, requirements: object }>}
 */
async function run(userInput, onProgress = () => {}) {
  const emit = (agent, status, data, progress) => onProgress({ agent, status, data, progress });

  // ── Step 1: Requirement Analysis ──────────────────────────────────────────
  emit('RequirementAgent', 'running', null, 5);
  let requirements;
  try {
    requirements = await requirementAgent.analyze(userInput);
    emit('RequirementAgent', 'complete', requirements, 20);
  } catch (err) {
    emit('RequirementAgent', 'error', { message: err.message }, 20);
    throw err;
  }

  // ── Step 2: Structure Design ───────────────────────────────────────────────
  emit('StructureAgent', 'running', null, 25);
  let structure;
  try {
    structure = await structureAgent.design(requirements);
    emit('StructureAgent', 'complete', structure, 40);
  } catch (err) {
    emit('StructureAgent', 'error', { message: err.message }, 40);
    throw err;
  }

  // ── Step 3: Component Planning ─────────────────────────────────────────────
  emit('ComponentAgent', 'running', null, 45);
  let componentPlan;
  try {
    componentPlan = await componentAgent.plan(structure, requirements);
    emit('ComponentAgent', 'complete', componentPlan, 60);
  } catch (err) {
    emit('ComponentAgent', 'error', { message: err.message }, 60);
    throw err;
  }

  // ── Step 4: Code Generation ────────────────────────────────────────────────
  emit('CodeAgent', 'running', null, 65);
  let generatedCode;
  try {
    generatedCode = await codeAgent.generate(componentPlan, requirements, structure);
    emit('CodeAgent', 'complete', { fileCount: generatedCode.files?.length ?? 0 }, 85);
  } catch (err) {
    emit('CodeAgent', 'error', { message: err.message }, 85);
    throw err;
  }

  // ── Step 5: Validation ─────────────────────────────────────────────────────
  emit('ValidationAgent', 'running', null, 88);
  let validation;
  try {
    validation = await validationAgent.validate(generatedCode, requirements);
    emit('ValidationAgent', 'complete', { score: validation.score, isValid: validation.isValid }, 98);
  } catch (err) {
    // Validation failure is non-fatal – we still return the generated code.
    validation = { isValid: true, score: null, suggestions: [], optimizedCode: null };
    emit('ValidationAgent', 'error', { message: err.message }, 98);
  }

  // Use optimised code if the validation agent produced one
  const finalFiles = validation.optimizedCode?.files ?? generatedCode.files;

  emit('Pipeline', 'complete', null, 100);

  return {
    files: finalFiles,
    validation,
    requirements,
  };
}

export default { run };
