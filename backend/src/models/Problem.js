const supabase = require('../config/db');

class Problem {
  // Get all problems with their testcases
  static async getAllProblems() {
    const { data, error } = await supabase
      .from('problems')
      .select(`
        *,
        testcases (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Get a single problem by ID with its testcases
  static async getProblemById(id) {
    const { data, error } = await supabase
      .from('problems')
      .select(`
        *,
        testcases (*)
      `)
      .eq('id', id);

    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data[0];
  }

  // Create a new problem
  static async createProblem(problemData) {
    const { data, error } = await supabase
      .from('problems')
      .insert([{
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        total_points: problemData.total_points
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a problem
  static async updateProblem(id, problemData) {
    const { data, error } = await supabase
      .from('problems')
      .update({
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        total_points: problemData.total_points
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a problem
  static async deleteProblem(id) {
    const { data, error } = await supabase
      .from('problems')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) return null;
    return data[0];
  }
}

module.exports = Problem;
