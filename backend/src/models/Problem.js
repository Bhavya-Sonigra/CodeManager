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
    console.log(`Problem model: Getting problem with ID: ${id}`);
    
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error in getProblemById:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No problem found with ID:', id);
        return null;
      }
      
      console.log('Problem data retrieved:', data);
      return data;
    } catch (error) {
      console.error('Error in Problem.getProblemById:', error);
      throw error;
    }
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
    console.log(`Problem model: Updating problem with ID: ${id}`);
    console.log('Update data:', problemData);
    
    try {
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

      if (error) {
        console.error('Supabase error in updateProblem:', error);
        throw error;
      }
      
      console.log('Problem updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in Problem.updateProblem:', error);
      throw error;
    }
  }

  // Delete a problem
  static async deleteProblem(id) {
    const { data, error } = await supabase
      .from('problems')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = Problem;
