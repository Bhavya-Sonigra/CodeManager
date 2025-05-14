const supabase = require('../config/db');

class Testcase {
  // Get all testcases for a problem
  static async getTestcasesByProblemId(problemId) {
    const { data, error } = await supabase
      .from('testcases')
      .select('*')
      .eq('problem_id', problemId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Create a new testcase
  static async createTestcase(testcaseData) {
    const { data, error } = await supabase
      .from('testcases')
      .insert([{
        problem_id: testcaseData.problem_id,
        input: testcaseData.input,
        expected_output: testcaseData.expected_output,
        difficulty: testcaseData.difficulty,
        points: testcaseData.points
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a testcase
  static async updateTestcase(id, testcaseData) {
    const { data, error } = await supabase
      .from('testcases')
      .update({
        input: testcaseData.input,
        expected_output: testcaseData.expected_output,
        difficulty: testcaseData.difficulty,
        points: testcaseData.points
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a testcase
  static async deleteTestcase(id) {
    const { data, error } = await supabase
      .from('testcases')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete all testcases for a problem
  static async deleteTestcasesByProblemId(problemId) {
    const { error } = await supabase
      .from('testcases')
      .delete()
      .eq('problem_id', problemId);

    if (error) throw error;
  }

  // Validate total points for a problem's testcases
  static async validateTestcasePoints(problemId, expectedTotal) {
    const { data, error } = await supabase
      .from('testcases')
      .select('points')
      .eq('problem_id', problemId);

    if (error) throw error;

    const actualTotal = data.reduce((sum, testcase) => sum + parseFloat(testcase.points), 0);
    return Math.abs(actualTotal - expectedTotal) < 0.01; // Using small epsilon for floating-point comparison
  }
}

module.exports = Testcase;

module.exports = Testcase;
