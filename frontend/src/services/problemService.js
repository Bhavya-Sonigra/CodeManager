import { supabase } from '../supabaseClient';

export const problemService = {
  // Fetch all problems
  async getAllProblems() {
    const { data, error } = await supabase
      .from('problems')
      .select('*, testcases(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch a single problem by ID
  async getProblemById(id) {
    const { data, error } = await supabase
      .from('problems')
      .select('*, testcases(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new problem
  async createProblem(problem) {
    const { data, error } = await supabase
      .from('problems')
      .insert([problem])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing problem
  async updateProblem(id, problem) {
    const { data, error } = await supabase
      .from('problems')
      .update(problem)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a problem
  async deleteProblem(id) {
    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Create a new testcase
  async createTestcase(testcase) {
    const { data, error } = await supabase
      .from('testcases')
      .insert([testcase])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing testcase
  async updateTestcase(id, testcase) {
    const { data, error } = await supabase
      .from('testcases')
      .update(testcase)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a testcase
  async deleteTestcase(id) {
    const { error } = await supabase
      .from('testcases')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Fetch testcases by problem ID
  async getTestcasesByProblemId(problemId) {
    const { data, error } = await supabase
      .from('testcases')
      .select('*')
      .eq('problem_id', problemId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};
