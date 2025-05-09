using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;       
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InterviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Interviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Interview>>> GetInterviews()
        {
            return await _context.Interviews
                .Include(i => i.Application)
                .ToListAsync();
        }

        // GET: api/Interviews/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Interview>> GetInterview(int id)
        {
            var interview = await _context.Interviews
                .Include(i => i.Application)
                .FirstOrDefaultAsync(i => i.InterviewID == id);

            if (interview == null)
            {
                return NotFound();
            }

            return interview;
        }

        // POST: api/Interviews
        [HttpPost]
        public async Task<ActionResult<Interview>> PostInterview(Interview interview)
        {
            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInterview), new { id = interview.InterviewID }, interview);
        }

        // PUT: api/Interviews/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInterview(int id, Interview interview)
        {
            if (id != interview.InterviewID)
            {
                return BadRequest();
            }

            _context.Entry(interview).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InterviewExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Interviews/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterview(int id)
        {
            var interview = await _context.Interviews.FindAsync(id);
            if (interview == null)
            {
                return NotFound();
            }

            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InterviewExists(int id)
        {
            return _context.Interviews.Any(e => e.InterviewID == id);
        }
    }
}
