import { supabase } from './supabase';
import type { Case, CaseInput } from '../types';

export const caseService = {
  // Create a new case
  async createCase(input: CaseInput): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .insert([
        {
          title: input.title,
          code: input.code,
          create_time: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  },

  // Get all cases with pagination
  async getCases(page: number = 1, limit: number = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .order('create_time', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data as Case[],
      total: count || 0,
      hasMore: (from + limit) < (count || 0),
    };
  },

  // Search cases by title
  async searchCases(
    query: string,
    page: number = 1,
    limit: number = 10
  ) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .ilike('title', `%${query}%`)
      .order('create_time', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data as Case[],
      total: count || 0,
      hasMore: (from + limit) < (count || 0),
    };
  },

  // Get a single case by ID
  async getCaseById(id: string): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Case;
  },

  // Update a case by ID
  async updateCase(id: string, input: CaseInput): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .update({ 
        title: input.title,
        code: input.code,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Case;
  },

  // Delete a case by ID
  async deleteCase(id: string): Promise<void> {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
